"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/supabase/profile";

export type ConvidarState = { ok: boolean; message: string; link?: string };

export async function convidarLocador(
  _prev: ConvidarState,
  formData: FormData,
): Promise<ConvidarState> {
  // Defesa: a service-role ignora RLS, então confirme o papel antes de agir.
  const profile = await getProfile();
  if (profile?.papel !== "admin") {
    return { ok: false, message: "Apenas administradores podem convidar locadores." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nome = String(formData.get("nome") ?? "").trim();
  const refs = formData.getAll("refs").map(String).filter(Boolean);
  if (!email) return { ok: false, message: "Informe o e-mail do locador." };
  if (refs.length === 0) return { ok: false, message: "Selecione ao menos um contrato." };

  const admin = createAdminClient();

  // Cria/convida o usuário e gera um link de acesso (independe de SMTP).
  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { data: { nome } },
  });

  let userId = data?.user?.id;
  if (!userId) {
    // Já existe: reaproveita o usuário e segue vinculando.
    const list = await admin.auth.admin.listUsers();
    userId = list.data.users.find((u) => u.email === email)?.id;
    if (!userId) return { ok: false, message: error?.message ?? "Não foi possível criar o convite." };
  }

  await admin.from("profiles").upsert({ id: userId, papel: "locador", nome: nome || null });

  const { error: linkErr } = await admin
    .from("contratos")
    .update({ locador_user_id: userId })
    .in("ref", refs);
  if (linkErr) return { ok: false, message: linkErr.message };

  revalidatePath("/locadores");
  revalidatePath("/cliente");

  const link = data?.properties?.action_link;
  return {
    ok: true,
    message: link
      ? `Locador vinculado a ${refs.length} contrato(s). Envie o link de acesso abaixo.`
      : `Locador vinculado a ${refs.length} contrato(s).`,
    link,
  };
}
