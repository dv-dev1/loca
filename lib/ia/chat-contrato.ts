// Chatbot do contrato: responde dúvidas usando como base de conhecimento o texto
// dos documentos anexados ao contrato. Mesma infra da extração (Ollama Cloud via
// SDK da OpenAI), mesmo contrato de erro: nunca lança — qualquer falha (chave
// ausente, sem documento, rede, resposta vazia) vira { ok: false, message } em
// pt-BR, para a UI do contrato degradar sem quebrar.
//
// Segurança: este módulo NÃO busca documento. Ele recebe apenas o texto que a
// camada de autorização (server action) já liberou para o usuário. Assim não há
// caminho onde o LLM veja um contrato de outra imobiliária — o isolamento fica
// inteiro na action, testado junto do resto do multi-tenant.

import OpenAI from "openai";

export type DocumentoContexto = { nome: string; texto: string | null };

// Um turno anterior da conversa. "usuario" = pergunta feita antes; "assistente"
// = resposta que o bot deu. Vira mensagem user/assistant no envio ao modelo.
export type TurnoHistorico = { autor: "usuario" | "assistente"; texto: string };

export type ResponderResultado =
  | { ok: true; resposta: string }
  | { ok: false; message: string };

// Quantos turnos anteriores mandar de volta. Contrato + histórico competem pelo
// contexto; ~8 turnos (4 perguntas + 4 respostas) cobrem uma conversa real sem
// inflar a conta. Os mais antigos caem primeiro.
const MAX_TURNOS_HISTORICO = 8;

const MENSAGEM_INDISPONIVEL =
  "Assistente indisponível no momento. Tente novamente mais tarde.";
const MENSAGEM_SEM_BASE =
  "Este contrato ainda não tem documentos com texto para eu consultar. Anexe o PDF do contrato e tente de novo.";
const MENSAGEM_SEM_PERGUNTA = "Escreva uma pergunta sobre o contrato.";
const MENSAGEM_FALHA =
  "Não consegui responder agora. Tente reformular a pergunta ou tente de novo em instantes.";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "https://ollama.com/v1";
// Chat tolera modelo mais leve que a extração estruturada — dá para trocar por
// um mais barato via OLLAMA_CHAT_MODEL sem tocar em código.
const MODELO_PADRAO = "gpt-oss:120b";

// Teto de caracteres do contexto enviado ao modelo. Um contrato de locação cabe
// folgado; o corte evita estourar o contexto (e a conta) se alguém anexar um PDF
// gigante. ~48k caracteres ≈ 12k tokens.
const MAX_CONTEXTO = 48_000;

const SYSTEM = `Você é um assistente que tira dúvidas sobre um contrato de locação brasileiro.
Responda SOMENTE com base no texto do contrato fornecido. Regras:
- Se a resposta não estiver no texto, diga claramente que o contrato não trata disso — nunca invente cláusula, valor ou data.
- Seja direto e em português do Brasil. Cite o trecho ou a cláusula quando ajudar.
- Você não dá aconselhamento jurídico; explica o que o contrato diz.`;

let clientSingleton: OpenAI | null = null;
function getClient(): OpenAI {
  if (!clientSingleton) {
    clientSingleton = new OpenAI({
      apiKey: process.env.OLLAMA_API_KEY,
      baseURL: OLLAMA_BASE_URL,
    });
  }
  return clientSingleton;
}

function montarContexto(documentos: DocumentoContexto[]): string {
  const partes: string[] = [];
  let total = 0;
  for (const doc of documentos) {
    const texto = doc.texto?.trim();
    if (!texto) continue;
    const bloco = `### ${doc.nome}\n${texto}`;
    if (total + bloco.length > MAX_CONTEXTO) {
      partes.push(bloco.slice(0, MAX_CONTEXTO - total));
      break;
    }
    partes.push(bloco);
    total += bloco.length;
  }
  return partes.join("\n\n");
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function responderSobreContrato(args: {
  pergunta: string;
  documentos: DocumentoContexto[];
  historico?: TurnoHistorico[];
}): Promise<ResponderResultado> {
  if (!process.env.OLLAMA_API_KEY) {
    return { ok: false, message: MENSAGEM_INDISPONIVEL };
  }

  const pergunta = args.pergunta.trim();
  if (!pergunta) {
    return { ok: false, message: MENSAGEM_SEM_PERGUNTA };
  }

  const contexto = montarContexto(args.documentos);
  if (!contexto) {
    return { ok: false, message: MENSAGEM_SEM_BASE };
  }

  // O texto do contrato vai no system, uma vez só — assim ele não se repete a
  // cada turno do histórico e sobra contexto para a conversa em si.
  const system: ChatMessage = {
    role: "system",
    content: `${SYSTEM}\n\nTexto do contrato em análise:\n\n${contexto}`,
  };

  // Turnos anteriores viram mensagens user/assistant reais, para o modelo
  // entender perguntas de acompanhamento ("e a multa disso?", "explica melhor").
  const historico: ChatMessage[] = (args.historico ?? [])
    .slice(-MAX_TURNOS_HISTORICO)
    .map((t) => ({ role: t.autor === "usuario" ? "user" : "assistant", content: t.texto }));

  try {
    const response = await getClient().chat.completions.create({
      model: process.env.OLLAMA_CHAT_MODEL || process.env.OLLAMA_MODEL || MODELO_PADRAO,
      messages: [system, ...historico, { role: "user", content: pergunta }],
    });

    const resposta = response.choices[0]?.message?.content?.trim();
    if (!resposta) return { ok: false, message: MENSAGEM_FALHA };

    return { ok: true, resposta };
  } catch (err) {
    console.error("Falha no chatbot do contrato:", err);
    return { ok: false, message: MENSAGEM_FALHA };
  }
}
