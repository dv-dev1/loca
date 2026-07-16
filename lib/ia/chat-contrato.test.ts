// Chatbot do contrato: responde dúvidas usando o texto dos documentos anexados.
//
// O foco destes testes é o que dá errado, não o caminho feliz — o LLM real não
// roda aqui. Duas coisas precisam valer sempre:
//   1. degradação: sem chave, PDF sem texto, ou rede caindo → mensagem em pt-BR,
//      nunca exceção que derruba a página do contrato;
//   2. o módulo só recebe o texto que a camada de autorização já liberou — ele
//      não busca documento sozinho, então não há caminho onde veja contrato de
//      outra org (o isolamento é testado na server action, ver actions.test.ts).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create } };
  },
}));

beforeEach(() => {
  vi.resetModules();
  create.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const CONTEXTO = [
  { nome: "Contrato.pdf", texto: "O reajuste é anual pelo IGP-M. Multa rescisória de 3 aluguéis." },
];

describe("responderSobreContrato", () => {
  it("responde a partir do texto do contrato quando tudo está configurado", async () => {
    vi.stubEnv("OLLAMA_API_KEY", "chave-x");
    create.mockResolvedValue({
      choices: [{ message: { content: "O reajuste é anual, pelo IGP-M." } }],
    });

    const { responderSobreContrato } = await import("./chat-contrato");
    const r = await responderSobreContrato({
      pergunta: "Qual o índice de reajuste?",
      documentos: CONTEXTO,
    });

    expect(r.ok).toBe(true);
    if (r.ok) expect(r.resposta).toContain("IGP-M");
  });

  it("degrada com mensagem em pt-BR quando a chave não está configurada", async () => {
    vi.stubEnv("OLLAMA_API_KEY", "");

    const { responderSobreContrato } = await import("./chat-contrato");
    const r = await responderSobreContrato({ pergunta: "Qualquer coisa?", documentos: CONTEXTO });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/indisponível/i);
    // Não deve nem tentar chamar o modelo sem chave.
    expect(create).not.toHaveBeenCalled();
  });

  it("recusa quando não há texto de documento para consultar", async () => {
    vi.stubEnv("OLLAMA_API_KEY", "chave-x");

    const { responderSobreContrato } = await import("./chat-contrato");
    const r = await responderSobreContrato({ pergunta: "E aí?", documentos: [] });

    expect(r.ok).toBe(false);
    // Sem base de conhecimento não há o que responder — e não gasta chamada de LLM.
    expect(create).not.toHaveBeenCalled();
  });

  it("recusa pergunta vazia", async () => {
    vi.stubEnv("OLLAMA_API_KEY", "chave-x");

    const { responderSobreContrato } = await import("./chat-contrato");
    const r = await responderSobreContrato({ pergunta: "   ", documentos: CONTEXTO });

    expect(r.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("não lança quando a chamada ao modelo falha — degrada", async () => {
    vi.stubEnv("OLLAMA_API_KEY", "chave-x");
    create.mockRejectedValue(new Error("timeout de rede"));

    const { responderSobreContrato } = await import("./chat-contrato");
    const r = await responderSobreContrato({ pergunta: "Qual a multa?", documentos: CONTEXTO });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toBeTruthy();
  });

  it("envia o texto dos documentos ao modelo como contexto", async () => {
    vi.stubEnv("OLLAMA_API_KEY", "chave-x");
    create.mockResolvedValue({ choices: [{ message: { content: "resposta" } }] });

    const { responderSobreContrato } = await import("./chat-contrato");
    await responderSobreContrato({ pergunta: "Qual a multa?", documentos: CONTEXTO });

    const args = create.mock.calls[0][0];
    const conteudoEnviado = JSON.stringify(args.messages);
    // O texto do contrato precisa chegar ao modelo; senão ele responde no vácuo.
    expect(conteudoEnviado).toContain("Multa rescisória");
  });

  it("envia o histórico da conversa ao modelo, para perguntas de acompanhamento", async () => {
    vi.stubEnv("OLLAMA_API_KEY", "chave-x");
    create.mockResolvedValue({ choices: [{ message: { content: "resposta" } }] });

    const { responderSobreContrato } = await import("./chat-contrato");
    await responderSobreContrato({
      pergunta: "E se for o locador?",
      documentos: CONTEXTO,
      historico: [
        { autor: "usuario", texto: "Qual a multa por rescisão?" },
        { autor: "assistente", texto: "A multa é de 3 aluguéis." },
      ],
    });

    const args = create.mock.calls[0][0];
    // O modelo precisa ver os turnos anteriores como mensagens reais (user/assistant),
    // senão "e se for o locador?" não tem referente e a conversa não flui.
    const mensagens = args.messages as { role: string; content: string }[];
    const roles = mensagens.map((m) => m.role);
    expect(roles).toContain("assistant");

    const turnoAnterior = mensagens.find(
      (m) => m.role === "assistant" && String(m.content).includes("3 aluguéis"),
    );
    expect(turnoAnterior).toBeTruthy();

    // E a pergunta atual segue sendo a última mensagem do usuário.
    const ultima = args.messages[args.messages.length - 1];
    expect(ultima.role).toBe("user");
    expect(String(ultima.content)).toContain("E se for o locador?");
  });

  it("funciona sem histórico (primeira pergunta da conversa)", async () => {
    vi.stubEnv("OLLAMA_API_KEY", "chave-x");
    create.mockResolvedValue({ choices: [{ message: { content: "resposta" } }] });

    const { responderSobreContrato } = await import("./chat-contrato");
    const r = await responderSobreContrato({ pergunta: "Qual a multa?", documentos: CONTEXTO });

    expect(r.ok).toBe(true);
    // Sem histórico: system + user (contrato + pergunta). Nada de assistant.
    const mensagens = create.mock.calls[0][0].messages as { role: string }[];
    const roles = mensagens.map((m) => m.role);
    expect(roles).not.toContain("assistant");
  });
});
