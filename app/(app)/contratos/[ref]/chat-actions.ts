"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/profile";
import {
  type ResponderResultado,
  type TurnoHistorico,
  responderSobreContrato,
} from "@/lib/ia/chat-contrato";

export type PerguntarState = ResponderResultado;

/**
 * Responde uma dúvida sobre um contrato usando o texto dos documentos anexados.
 *
 * Toda a autorização mora aqui: o contrato e seus documentos são lidos pelo
 * client normal (RLS-aware), então o Postgres já restringe à org do usuário e,
 * para locador, aos contratos vinculados a ele. Só o texto assim liberado chega
 * ao módulo de IA — não há caminho onde o LLM veja contrato de outra imobiliária.
 */
export async function perguntarSobreContrato(
  ref: string,
  pergunta: string,
  historico: TurnoHistorico[] = [],
): Promise<PerguntarState> {
  const profile = await getProfile();
  if (!profile) {
    return { ok: false, message: "Faça login para usar o assistente." };
  }

  const supabase = await createClient();

  // RLS decide o que este usuário enxerga. Se o contrato não for da org dele
  // (ou, sendo locador, não for vinculado a ele), a busca volta vazia — e a
  // resposta é a mesma de "não existe", sem vazar a existência do contrato.
  const { data: contrato } = await supabase
    .from("contratos")
    .select("id, documentos(nome, texto)")
    .ilike("ref", ref)
    .maybeSingle();

  const row = contrato as { id: string; documentos: { nome: string; texto: string | null }[] | null } | null;
  if (!row) {
    return { ok: false, message: "Contrato não encontrado." };
  }

  return responderSobreContrato({
    pergunta,
    documentos: row.documentos ?? [],
    historico,
  });
}
