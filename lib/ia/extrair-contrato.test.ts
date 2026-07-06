import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();

vi.mock("openai", () => ({
  default: class {
    responses = { create: createMock };
  },
}));

const ORIGINAL_ENV = process.env.OPENAI_API_KEY;

describe("extrairContratoDoPdf", () => {
  beforeEach(() => {
    vi.resetModules();
    createMock.mockReset();
    process.env.OPENAI_API_KEY = "sk-teste";
  });

  afterAll(() => {
    process.env.OPENAI_API_KEY = ORIGINAL_ENV;
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
    createMock.mockResolvedValue({ output_text: JSON.stringify(dados) });

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado).toEqual({ ok: true, dados });
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
    createMock.mockResolvedValue({ output_text: JSON.stringify(dados) });

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado).toEqual({ ok: true, dados });
  });

  it("retorna erro (sem lançar) quando a resposta da IA não é JSON válido", async () => {
    createMock.mockResolvedValue({ output_text: "isto não é JSON" });

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.message).toMatch(/preencha os campos manualmente/i);
  });

  it("retorna erro (sem lançar) quando a chamada à OpenAI falha", async () => {
    createMock.mockRejectedValue(new Error("network down"));

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.message).toMatch(/preencha os campos manualmente/i);
  });

  it("retorna erro sem chamar a IA quando OPENAI_API_KEY não está configurada", async () => {
    delete process.env.OPENAI_API_KEY;

    const { extrairContratoDoPdf } = await import("./extrair-contrato");
    const resultado = await extrairContratoDoPdf({ buffer: Buffer.from("pdf"), filename: "contrato.pdf" });

    expect(resultado.ok).toBe(false);
    expect(createMock).not.toHaveBeenCalled();
  });
});
