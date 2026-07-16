import { supabaseConfigured } from "./client";
import { getProfile } from "./profile";
import { createClient } from "./server";

export type OrgSettings = { nome: string; whatsapp: string | null; email: string | null };

const PADRAO: OrgSettings = { nome: "Imobiliária", whatsapp: null, email: null };

/**
 * Configurações da imobiliária do usuário autenticado.
 *
 * Cada org tem sua própria linha (04_multi_tenant.sql) — antes era uma linha
 * única com id=1. O RLS já restringe a leitura à org do usuário, mas o filtro
 * vai explícito: `single()` numa tabela que hoje tem N linhas precisa de um
 * escopo, senão quebra assim que existir a segunda imobiliária.
 */
export async function getOrgSettings(): Promise<OrgSettings> {
  if (!supabaseConfigured) return PADRAO;

  const profile = await getProfile();
  if (!profile?.orgId) return PADRAO;

  const supabase = await createClient();
  const { data } = await supabase
    .from("org_settings")
    .select("nome, whatsapp, email")
    .eq("org_id", profile.orgId)
    .maybeSingle();
  return (data as OrgSettings | null) ?? PADRAO;
}
