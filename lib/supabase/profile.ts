import { supabaseConfigured } from "./client";
import { createClient } from "./server";

export type Papel = "admin" | "locador";
export type Profile = { id: string; papel: Papel; nome: string | null; orgId: string | null };

type ProfileRow = { id: string; papel: Papel; nome: string | null; org_id: string | null };

/** Perfil (papel + imobiliária) do usuário autenticado, ou null se não houver sessão. */
export async function getProfile(): Promise<Profile | null> {
  // Supabase ainda não configurado → modo demo: trata o visitante como admin, sem rede.
  if (!supabaseConfigured) {
    return { id: "demo", papel: "admin", nome: "Imobiliária Demo", orgId: "demo" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, papel, nome, org_id")
    .eq("id", user.id)
    .single();

  const row = data as ProfileRow | null;

  // Sem linha de perfil (caso raro): locador sem org — o estado de menor
  // privilégio. orgId null não casa com org nenhuma, então não alcança dado
  // de ninguém.
  if (!row) return { id: user.id, papel: "locador", nome: null, orgId: null };

  return { id: row.id, papel: row.papel, nome: row.nome, orgId: row.org_id };
}
