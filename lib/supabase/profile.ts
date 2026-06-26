import { createClient } from "./server";

export type Papel = "admin" | "locador";
export type Profile = { id: string; papel: Papel; nome: string | null };

/** Perfil (papel) do usuário autenticado, ou null se não houver sessão. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, papel, nome")
    .eq("id", user.id)
    .single();

  // Sem linha de perfil (caso raro): trata como locador, o papel de menor privilégio.
  return (data as Profile | null) ?? { id: user.id, papel: "locador", nome: null };
}
