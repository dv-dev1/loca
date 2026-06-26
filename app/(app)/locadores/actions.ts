"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/supabase/profile";
import { gerarSenha } from "@/lib/domain/senha";

export type ConvidarState = {
  ok: boolean;
  message: string;
  email?: string;
  password?: string;
};

export async function convidarLocador(
  _prev: ConvidarState,
  formData: FormData,
): Promise<ConvidarState> {
  const profile = await getProfile();
  if (profile?.papel !== "admin") {
    return { ok: false, message: "Apenas administradores podem criar acessos." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nome = String(formData.get("nome") ?? "").trim();
  const refs = formData.getAll("refs").map(String).filter(Boolean);

  if (!email) return { ok: false, message: "Informe o e-mail do locador." };
  if (refs.length === 0) return { ok: false, message: "Selecione ao menos um contrato." };

  const admin = createAdminClient();
  const senha = gerarSenha();

  // Tenta criar o usuário; se já existir, atualiza a senha.
  let userId: string;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });

  if (created?.user?.id) {
    userId = created.user.id;
  } else {
    // Usuário já existe — localiza e redefine a senha.
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email === email);
    if (!existing) {
      return { ok: false, message: createErr?.message ?? "Não foi possível criar o acesso." };
    }
    userId = existing.id;
    const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
      password: senha,
      user_metadata: { nome },
    });
    if (updateErr) return { ok: false, message: updateErr.message };
  }

  await admin.from("profiles").upsert({ id: userId, papel: "locador", nome: nome || null });

  const { error: linkErr } = await admin
    .from("contratos")
    .update({ locador_user_id: userId })
    .in("ref", refs);
  if (linkErr) return { ok: false, message: linkErr.message };

  revalidatePath("/locadores");
  revalidatePath("/cliente");

  return {
    ok: true,
    message: `Acesso criado. Compartilhe as credenciais abaixo com o locador.`,
    email,
    password: senha,
  };
}
