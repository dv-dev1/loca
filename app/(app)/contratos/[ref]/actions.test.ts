import { beforeEach, describe, expect, it, vi } from "vitest";

const getProfile = vi.fn();
const eq = vi.fn();
const del = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ delete: del }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/profile", () => ({ getProfile }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from }) }));

const { apagarContrato } = await import("./actions");

beforeEach(() => {
  getProfile.mockReset();
  from.mockClear();
  del.mockClear();
  eq.mockReset();
});

describe("apagarContrato", () => {
  it("apaga o contrato quando o usuário é admin", async () => {
    getProfile.mockResolvedValue({ papel: "admin" });
    eq.mockResolvedValue({ error: null });

    const resultado = await apagarContrato("LOC-0001");

    expect(from).toHaveBeenCalledWith("contratos");
    expect(eq).toHaveBeenCalledWith("ref", "LOC-0001");
    expect(resultado).toEqual({ ok: true });
  });

  it("recusa quando o usuário não é admin", async () => {
    getProfile.mockResolvedValue({ papel: "locador" });

    const resultado = await apagarContrato("LOC-0001");

    expect(resultado).toEqual({ ok: false, message: "Apenas administradores podem apagar contratos." });
    expect(del).not.toHaveBeenCalled();
  });

  it("retorna erro quando o banco falha", async () => {
    getProfile.mockResolvedValue({ papel: "admin" });
    eq.mockResolvedValue({ error: { message: "boom" } });

    const resultado = await apagarContrato("LOC-0001");

    expect(resultado).toEqual({ ok: false, message: "boom" });
  });
});
