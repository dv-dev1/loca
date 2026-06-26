import { createClient } from "./server";

export type OrgSettings = { nome: string; whatsapp: string | null; email: string | null };

const PADRAO: OrgSettings = { nome: "Imobiliária", whatsapp: null, email: null };

/** Configurações da imobiliária (single-tenant: linha id=1). */
export async function getOrgSettings(): Promise<OrgSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("org_settings")
    .select("nome, whatsapp, email")
    .eq("id", 1)
    .single();
  return (data as OrgSettings | null) ?? PADRAO;
}
