// Isolamento do chatbot entre imobiliárias.
//
// perguntarSobreContrato lê o contrato pelo client RLS-aware: o Postgres já
// restringe à org do usuário. Este teste prova o efeito — quando o RLS não
// devolve o contrato (org errada), o chat responde "não encontrado" e nunca
// chama o modelo com texto de outra imobiliária.

import { beforeEach, describe, expect, it, vi } from "vitest";

const getProfile = vi.fn();
const maybeSingle = vi.fn();
const responderSobreContrato = vi.fn();

vi.mock("@/lib/supabase/profile", () => ({ getProfile }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({ select: () => ({ ilike: () => ({ maybeSingle }) }) }),
  }),
}));
vi.mock("@/lib/ia/chat-contrato", () => ({ responderSobreContrato }));

beforeEach(() => {
  vi.resetModules();
  getProfile.mockReset();
  maybeSingle.mockReset();
  responderSobreContrato.mockReset();
  responderSobreContrato.mockResolvedValue({ ok: true, resposta: "resposta qualquer" });
});

describe("perguntarSobreContrato — isolamento", () => {
  it("não chama o modelo quando o RLS não devolve o contrato (outra org)", async () => {
    getProfile.mockResolvedValue({ id: "u1", papel: "admin", nome: null, orgId: "org-a" });
    // RLS filtrou: contrato de outra org some para este usuário.
    maybeSingle.mockResolvedValue({ data: null });

    const { perguntarSobreContrato } = await import("./chat-actions");
    const r = await perguntarSobreContrato("LOC-9999", "Qual a multa?");

    expect(r.ok).toBe(false);
    // O ponto: o texto de outra imobiliária nunca chega ao LLM.
    expect(responderSobreContrato).not.toHaveBeenCalled();
  });

  it("recusa quando não há usuário autenticado", async () => {
    getProfile.mockResolvedValue(null);

    const { perguntarSobreContrato } = await import("./chat-actions");
    const r = await perguntarSobreContrato("LOC-0001", "Qual a multa?");

    expect(r.ok).toBe(false);
    expect(maybeSingle).not.toHaveBeenCalled();
    expect(responderSobreContrato).not.toHaveBeenCalled();
  });

  it("responde quando o contrato é da org do usuário, passando só os documentos dele", async () => {
    getProfile.mockResolvedValue({ id: "u1", papel: "admin", nome: null, orgId: "org-a" });
    maybeSingle.mockResolvedValue({
      data: {
        id: "c1",
        documentos: [{ nome: "Contrato.pdf", texto: "Multa de 3 aluguéis." }],
      },
    });

    const { perguntarSobreContrato } = await import("./chat-actions");
    const r = await perguntarSobreContrato("LOC-0001", "Qual a multa?");

    expect(r.ok).toBe(true);
    // O módulo recebeu exatamente os documentos que o RLS liberou.
    expect(responderSobreContrato).toHaveBeenCalledWith({
      pergunta: "Qual a multa?",
      documentos: [{ nome: "Contrato.pdf", texto: "Multa de 3 aluguéis." }],
      historico: [],
    });
  });
});
