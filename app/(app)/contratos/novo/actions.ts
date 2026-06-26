"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/profile";

/** Próxima referência sequencial: LOC-#### a partir das existentes. */
function proximaRef(refs: string[]): string {
  const max = refs.reduce((m, r) => {
    const n = Number(r.replace(/\D/g, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `LOC-${String(max + 1).padStart(4, "0")}`;
}

function valorNumerico(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
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
  const imovel = get("imovel") || get("endereco") || "Imóvel sem identificação";

  await supabase.from("contratos").insert({
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
  });

  revalidatePath("/carteira");
  revalidatePath("/painel");
  redirect("/carteira");
}
