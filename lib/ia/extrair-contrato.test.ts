import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();
const extrairTextoMock = vi.fn();

// Cliente Ollama fala o dialeto Chat Completions (não a Responses API da OpenAI).
vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: createMock } };
  },
}));

// Isola a extração de texto do PDF (pdf-parse) atrás de um seam testável.
vi.mock("./pdf-texto", () => ({
  extrairTextoDoPdf: extrairTextoMock,
}));

const ORIGINAL_ENV = process.env.OLLAMA_API_KEY;

function respostaIA(dados: unknown) {
  return { choices: [{ message: { content: JSON.stringify(dados) } }] };
}

describe("extrairContratoDoPdf", () => {
  beforeEach(() => {
    vi.resetModules();
    createMock.mockReset();
    extrairTextoMock.mockReset();
    extrairTextoMock.mockResolvedValue("Texto do contrato de locação...");
    process.env.OLLAMA_API_KEY = "ollama-teste";
  });

  afterAll(() => {
    process.env.OLLAMA_API_KEY = ORIGINAL_ENV;
  });

  it("retorna os dados quando a IA extrai todos os campos", async () => {
    const dados = {
      imovel: "Casa · R. das Acácias, 120",
      endereco: "R. das Acácias, 120 — Jardim Sul",
      tipo: "Residencial",
      matricula: "44.812",
      iptu: "012.345.0001-7",
      locador: "Antônio Prado",
      locadorDoc: "123.456.789-00",
      locatario: "Família Ribeiro",
      locatarioDoc: "987.654.321-00",
      aluguel: "3100.00",
      indice: "IGP-M",
      inicio: "2024-06-01",
      fim: "2026-06-01",
      vencimentoDia: "05",
      garantia: "Fiador",
    };
    createMock.mockResolvedValue(respostaIA(dados));

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado).toEqual({ ok: true, dados });
  });

  it("envia o texto extraído do PDF ao modelo", async () => {
    extrairTextoMock.mockResolvedValue("LOCADOR: Antônio Prado ...");
    createMock.mockResolvedValue(respostaIA({}));

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(extrairTextoMock).toHaveBeenCalledOnce();
    const payload = createMock.mock.calls[0][0];
    const mensagens = JSON.stringify(payload.messages);
    expect(mensagens).toContain("Antônio Prado");
  });

  it("preserva campos null quando a IA não consegue extrair tudo", async () => {
    const dados = {
      imovel: "Apto 302 · Ed. Aurora",
      endereco: null,
      tipo: null,
      matricula: null,
      iptu: null,
      locador: "Helena Castro",
      locadorDoc: null,
      locatario: null,
      locatarioDoc: null,
      aluguel: null,
      indice: null,
      inicio: null,
      fim: null,
      vencimentoDia: null,
      garantia: null,
    };
    createMock.mockResolvedValue(respostaIA(dados));

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado).toEqual({ ok: true, dados });
  });

  it("retorna erro (sem lançar) quando a resposta da IA não é JSON válido", async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: "isto não é JSON" } }] });

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.message).toMatch(/preencha os campos manualmente/i);
  });

  it("retorna erro (sem lançar) quando a chamada ao Ollama falha", async () => {
    createMock.mockRejectedValue(new Error("network down"));

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.message).toMatch(/preencha os campos manualmente/i);
  });

  it("retorna erro sem chamar a IA quando OLLAMA_API_KEY não está configurada", async () => {
    delete process.env.OLLAMA_API_KEY;

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado.ok).toBe(false);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("retorna erro sem chamar a IA quando o PDF não tem texto extraível (escaneado)", async () => {
    extrairTextoMock.mockResolvedValue("   \n  ");

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado.ok).toBe(false);
    expect(createMock).not.toHaveBeenCalled();
  });
});
