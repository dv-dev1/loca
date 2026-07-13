import { beforeEach, describe, expect, it, vi } from "vitest";

const getProfile = vi.fn();

// contratos: delete().eq() e select().eq().single()
const deleteEq = vi.fn();
const contratosDelete = vi.fn(() => ({ eq: deleteEq }));
const findSingle = vi.fn();
const findEq = vi.fn(() => ({ single: findSingle }));
const contratosSelect = vi.fn(() => ({ eq: findEq }));

// anotacoes: insert().select().single()
const insertSingle = vi.fn();
const insertSelect = vi.fn(() => ({ single: insertSingle }));
const anotacoesInsert = vi.fn(() => ({ select: insertSelect }));

const from = vi.fn((table: string) => {
  if (table === "contratos") return { delete: contratosDelete, select: contratosSelect };
  if (table === "anotacoes") return { insert: anotacoesInsert };
  throw new Error(`tabela inesperada no mock: ${table}`);
});

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/profile", () => ({ getProfile }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from }) }));

const { adicionarAnotacao, apagarContrato } = await import("./actions");

beforeEach(() => {
  getProfile.mockReset();
  from.mockClear();
  contratosDelete.mockClear();
  deleteEq.mockReset();
  contratosSelect.mockClear();
  findEq.mockClear();
  findSingle.mockReset();
  anotacoesInsert.mockClear();
  insertSelect.mockClear();
  insertSingle.mockReset();
});

describe("apagarContrato", () => {
  it("apaga o contrato quando o usuário é admin", async () => {
    getProfile.mockResolvedValue({ papel: "admin" });
    deleteEq.mockResolvedValue({ error: null });

    const resultado = await apagarContrato("LOC-0001");

    expect(from).toHaveBeenCalledWith("contratos");
    expect(deleteEq).toHaveBeenCalledWith("ref", "LOC-0001");
    expect(resultado).toEqual({ ok: true });
  });

  it("recusa quando o usuário não é admin", async () => {
    getProfile.mockResolvedValue({ papel: "locador" });

    const resultado = await apagarContrato("LOC-0001");

    expect(resultado).toEqual({ ok: false, message: "Apenas administradores podem apagar contratos." });
    expect(contratosDelete).not.toHaveBeenCalled();
  });

  it("retorna erro quando o banco falha", async () => {
    getProfile.mockResolvedValue({ papel: "admin" });
    deleteEq.mockResolvedValue({ error: { message: "boom" } });

    const resultado = await apagarContrato("LOC-0001");

    expect(resultado).toEqual({ ok: false, message: "boom" });
  });
});

describe("adicionarAnotacao", () => {
  it("cria a anotação quando o usuário é admin", async () => {
    getProfile.mockResolvedValue({ papel: "admin" });
    findSingle.mockResolvedValue({ data: { id: "contrato-uuid" }, error: null });
    insertSingle.mockResolvedValue({
      data: { id: "nota-uuid", texto: "Ligar para o locatário", created_at: "2026-07-13T09:05:00.000Z" },
      error: null,
    });

    const resultado = await adicionarAnotacao("LOC-0001", "Ligar para o locatário");

    expect(findEq).toHaveBeenCalledWith("ref", "LOC-0001");
    expect(anotacoesInsert).toHaveBeenCalledWith({ contrato_id: "contrato-uuid", texto: "Ligar para o locatário" });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.anotacao.id).toBe("nota-uuid");
      expect(resultado.anotacao.texto).toBe("Ligar para o locatário");
    }
  });

  it("recusa quando o usuário não é admin", async () => {
    getProfile.mockResolvedValue({ papel: "locador" });

    const resultado = await adicionarAnotacao("LOC-0001", "Texto qualquer");

    expect(resultado).toEqual({ ok: false, message: "Apenas administradores podem adicionar anotações." });
    expect(anotacoesInsert).not.toHaveBeenCalled();
  });

  it("recusa texto vazio", async () => {
    getProfile.mockResolvedValue({ papel: "admin" });

    const resultado = await adicionarAnotacao("LOC-0001", "   ");

    expect(resultado).toEqual({ ok: false, message: "Escreva algo antes de salvar." });
    expect(anotacoesInsert).not.toHaveBeenCalled();
  });

  it("retorna erro quando o contrato não é encontrado", async () => {
    getProfile.mockResolvedValue({ papel: "admin" });
    findSingle.mockResolvedValue({ data: null, error: { message: "not found" } });

    const resultado = await adicionarAnotacao("LOC-9999", "Texto");

    expect(resultado).toEqual({ ok: false, message: "Contrato não encontrado." });
    expect(anotacoesInsert).not.toHaveBeenCalled();
  });

  it("retorna erro quando o banco falha ao inserir", async () => {
    getProfile.mockResolvedValue({ papel: "admin" });
    findSingle.mockResolvedValue({ data: { id: "contrato-uuid" }, error: null });
    insertSingle.mockResolvedValue({ data: null, error: { message: "boom" } });

    const resultado = await adicionarAnotacao("LOC-0001", "Texto");

    expect(resultado).toEqual({ ok: false, message: "boom" });
  });
});
