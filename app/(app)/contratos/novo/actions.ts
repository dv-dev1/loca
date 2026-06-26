"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/supabase/profile";

function proximaRef(refs: string[]): string {
  const max = refs.reduce((m, r) => {
    const n = Number(r.replace(/\D/g, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `LOC-${String(max + 1).padStart(4, "0")}`;
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
  const { data: existentes } = await supabase.from("contratos").select("ref");
  const ref = proximaRef(((existentes as { ref: string }[] | null) ?? []).map((r) => r.ref));

  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const imovel = get("imovel") || get("endereco") || "";

  if (!imovel) throw new Error("Identificação do imóvel é obrigatória.");
  if (!get("inicio")) throw new Error("Data de início é obrigatória.");
  if (!get("fim")) throw new Error("Data de fim é obrigatória.");
  if (!get("locador")) throw new Error("Nome do locador é obrigatório.");
  if (!get("locatario")) throw new Error("Nome do locatário é obrigatório.");

  // Insere o contrato e recupera o UUID para vincular os documentos.
  const { data: novoContrato, error: insertErr } = await supabase
    .from("contratos")
    .insert({
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
    })
    .select("id")
    .single();

  if (insertErr || !novoContrato) {
    throw new Error(insertErr?.message ?? "Falha ao criar contrato.");
  }

  // Faz upload dos documentos anexados.
  const arquivos = formData.getAll("documentos") as File[];
  const validos = arquivos.filter((f) => f instanceof File && f.size > 0);

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
        await admin.from("documentos").insert({
          contrato_id: novoContrato.id,
          nome,
          storage_path: storagePath,
        });
      }
      // Falha silenciosa por arquivo individual — o contrato já foi criado.
    }
  }

  revalidatePath("/carteira");
  revalidatePath("/painel");
  redirect("/carteira");
}
