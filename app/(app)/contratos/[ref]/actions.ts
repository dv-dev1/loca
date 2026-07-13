"use server";

import { revalidatePath } from "next/cache";
import type { Anotacao } from "@/app/_data/contratos";
import { formatDataHora } from "@/lib/domain/datas";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/profile";

export type ApagarContratoState = { ok: boolean; message?: string };

export type AdicionarAnotacaoState = { ok: true; anotacao: Anotacao } | { ok: false; message: string };

export async function adicionarAnotacao(ref: string, texto: string): Promise<AdicionarAnotacaoState> {
  const profile = await getProfile();
  if (profile?.papel !== "admin") {
    return { ok: false, message: "Apenas administradores podem adicionar anotações." };
  }

  const textoLimpo = texto.trim();
  if (!textoLimpo) {
    return { ok: false, message: "Escreva algo antes de salvar." };
  }

  const supabase = await createClient();
  const { data: contratoRow, error: findErr } = await supabase
    .from("contratos")
    .select("id")
    .eq("ref", ref)
    .single();
  if (findErr || !contratoRow) {
    return { ok: false, message: "Contrato não encontrado." };
  }

  const { data: nova, error } = await supabase
    .from("anotacoes")
    .insert({ contrato_id: contratoRow.id, texto: textoLimpo })
    .select("id, texto, created_at")
    .single();
  if (error || !nova) {
    return { ok: false, message: error?.message ?? "Não foi possível salvar a anotação." };
  }

  revalidatePath(`/contratos/${ref}`);
  return { ok: true, anotacao: { id: nova.id, texto: nova.texto, criadoEm: formatDataHora(new Date(nova.created_at)) } };
}

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
