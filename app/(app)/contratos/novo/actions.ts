"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/supabase/profile";
import { type ExtrairContratoResultado, extrairContratoDoPdf } from "@/lib/ia/extrair-contrato";

function proximaRef(refs: string[]): string {
  const max = refs.reduce((m, r) => {
    const n = Number(r.replace(/\D/g, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `LOC-${String(max + 1).padStart(4, "0")}`;
}

const MAX_TENTATIVAS_REF = 5;

/**
 * Calcula o próximo ref e insere o contrato, tentando de novo se colidir com
 * um ref criado por outra requisição entre o SELECT e o INSERT (ref tem
 * unique constraint no banco — 23505 é o código de unique_violation do Postgres).
 */
async function inserirContratoComRefUnica(
  supabase: Awaited<ReturnType<typeof createClient>>,
  montarInsert: (ref: string) => Record<string, unknown>,
): Promise<{ ref: string; id: string }> {
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS_REF; tentativa++) {
    const { data: existentes } = await supabase.from("contratos").select("ref");
    const ref = proximaRef(((existentes as { ref: string }[] | null) ?? []).map((r) => r.ref));

    const { data, error } = await supabase.from("contratos").insert(montarInsert(ref)).select("id").single();

    if (!error && data) return { ref, id: (data as { id: string }).id };
    if (error?.code !== "23505") throw new Error(error?.message ?? "Falha ao criar contrato.");
    // colisão de ref: outra criação simultânea já usou esse número — recalcula e tenta de novo.
  }

  throw new Error("Não foi possível gerar uma referência única para o contrato. Tente novamente.");
}

function valorNumerico(raw: string): number {
  // Remove tudo exceto dígitos e vírgula (separador decimal no BR).
  // "R$ 3.100,00" → "3100,00" → "3100" → 3100
  let s = raw.replace(/[^\d,]/g, "");
  const comma = s.indexOf(",");
  if (comma !== -1) s = s.slice(0, comma); // descarta centavos
  return s ? Number(s) : 0;
}

async function garantirBucket(admin: ReturnType<typeof createAdminClient>) {
  const { error } = await admin.storage.createBucket("documentos", {
    public: false,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  });
  // Ignora se o bucket já existir.
  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Não foi possível criar o bucket de documentos: ${error.message}`);
  }
}

export async function criarContrato(formData: FormData) {
  const profile = await getProfile();
  if (profile?.papel !== "admin") {
    throw new Error("Apenas administradores podem cadastrar contratos.");
  }

  const supabase = await createClient();

  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const imovel = get("imovel") || get("endereco") || "";

  if (!imovel) throw new Error("Identificação do imóvel é obrigatória.");
  if (!get("inicio")) throw new Error("Data de início é obrigatória.");
  if (!get("fim")) throw new Error("Data de fim é obrigatória.");
  if (!get("locador")) throw new Error("Nome do locador é obrigatório.");
  if (!get("locatario")) throw new Error("Nome do locatário é obrigatório.");

  // Insere o contrato (com retry em caso de colisão de ref) e recupera o UUID
  // pra vincular os documentos.
  const { ref, id: novoContratoId } = await inserirContratoComRefUnica(supabase, (ref) => ({
    ref,
    tipo: get("tipo") || "Residencial",
    imovel,
    endereco: get("endereco") || null,
    matricula: get("matricula") || null,
    iptu: get("iptu") || null,
    locador: get("locador") || null,
    locador_doc: get("locadorDoc") || null,
    locatario: get("locatario") || null,
    locatario_doc: get("locatarioDoc") || null,
    aluguel: valorNumerico(get("aluguel")),
    indice: get("indice") || "IGP-M",
    vencimento_dia: get("vencimentoDia") ? Number(get("vencimentoDia").replace(/\D/g, "")) : null,
    inicio: get("inicio") || null,
    fim: get("fim") || null,
    garantia: get("garantia") || null,
  }));

  // Faz upload dos documentos anexados.
  const arquivos = formData.getAll("documentos") as File[];
  const validos = arquivos.filter((f) => f instanceof File && f.size > 0);
  const falhas: string[] = [];

  if (validos.length > 0) {
    const admin = createAdminClient();
    await garantirBucket(admin);

    for (const arquivo of validos) {
      const nome = arquivo.name;
      const safeName = `${Date.now()}-${nome.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const storagePath = `${ref}/${safeName}`;

      const bytes = await arquivo.arrayBuffer();
      const { error: upErr } = await admin.storage
        .from("documentos")
        .upload(storagePath, bytes, { contentType: arquivo.type || "application/octet-stream" });

      if (!upErr) {
        const { error: insertDocErr } = await admin.from("documentos").insert({
          contrato_id: novoContratoId,
          nome,
          storage_path: storagePath,
        });
        if (insertDocErr) falhas.push(nome);
      } else {
        falhas.push(nome);
      }
      // Falha por arquivo individual não interrompe os demais — o contrato já foi criado,
      // mas o admin precisa saber quais anexos não subiram (ver redirect abaixo).
    }
  }

  revalidatePath("/carteira");
  revalidatePath("/painel");
  redirect(falhas.length > 0 ? `/carteira?falhaUpload=${encodeURIComponent(falhas.join(", "))}` : "/carteira");
}

/** Extrai os dados de um contrato a partir do PDF assinado, via IA, para pré-preencher o formulário. */
export async function extrairContrato(formData: FormData): Promise<ExtrairContratoResultado> {
  const profile = await getProfile();
  if (profile?.papel !== "admin") {
    return { ok: false, message: "Apenas administradores podem usar a extração automática." };
  }

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, message: "Nenhum arquivo recebido." };
  }
  if (arquivo.type !== "application/pdf") {
    return { ok: false, message: "Envie um arquivo PDF." };
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  return extrairContratoDoPdf({ buffer, filename: arquivo.name });
}
