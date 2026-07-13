"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/profile";

export type ApagarContratoState = { ok: boolean; message?: string };

export async function apagarContrato(ref: string): Promise<ApagarContratoState> {
  const profile = await getProfile();
  if (profile?.papel !== "admin") {
    return { ok: false, message: "Apenas administradores podem apagar contratos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contratos").delete().eq("ref", ref);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/carteira");
  revalidatePath("/painel");
  return { ok: true };
}
