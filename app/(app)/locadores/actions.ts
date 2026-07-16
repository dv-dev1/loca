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
  // Admin sem org não tem escopo — sem isto, as queries abaixo rodariam com
  // org_id undefined no admin client, que ignora RLS.
  if (!profile.orgId) {
    return { ok: false, message: "Seu usuário não está vinculado a uma imobiliária." };
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

    // listUsers() varre a base inteira, não só esta org. Sem esta checagem, um
    // admin poderia redefinir a senha de um locador de outra imobiliária só
    // conhecendo o e-mail dele.
    const { data: perfilExistente } = await admin
      .from("profiles")
      .select("org_id")
      .eq("id", userId)
      .maybeSingle();
    const orgDoUsuario = (perfilExistente as { org_id: string | null } | null)?.org_id ?? null;
    if (orgDoUsuario && orgDoUsuario !== profile.orgId) {
      return { ok: false, message: "Este e-mail já tem acesso em outra imobiliária." };
    }

    const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
      password: senha,
      user_metadata: { nome },
    });
    if (updateErr) return { ok: false, message: updateErr.message };
  }

  await admin
    .from("profiles")
    .upsert({ id: userId, papel: "locador", nome: nome || null, org_id: profile.orgId });

  // O admin client ignora RLS, então o escopo por org vai explícito aqui: sem o
  // .eq("org_id"), um admin poderia vincular seu locador a refs de outra
  // imobiliária apenas passando-os no formulário.
  const { data: vinculados, error: linkErr } = await admin
    .from("contratos")
    .update({ locador_user_id: userId })
    .eq("org_id", profile.orgId)
    .in("ref", refs)
    .select("ref");
  if (linkErr) return { ok: false, message: linkErr.message };

  // Nenhuma linha afetada = os refs não são desta org (ou não existem). Sem
  // isto, o convite reportaria sucesso sem ter vinculado nada.
  const refsVinculados = ((vinculados as { ref: string }[] | null) ?? []).map((c) => c.ref);
  if (refsVinculados.length === 0) {
    return { ok: false, message: "Nenhum dos contratos selecionados pertence à sua imobiliária." };
  }

  const ignorados = refs.filter((r) => !refsVinculados.includes(r));

  revalidatePath("/locadores");
  revalidatePath("/cliente");

  return {
    ok: true,
    message:
      ignorados.length > 0
        ? `Acesso criado para ${refsVinculados.length} contrato(s). Ignorados (fora da sua imobiliária): ${ignorados.join(", ")}.`
        : "Acesso criado. Compartilhe as credenciais abaixo com o locador.",
    email,
    password: senha,
  };
}
