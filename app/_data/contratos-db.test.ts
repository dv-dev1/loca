import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn();

vi.mock("@/lib/supabase/server", () => ({ createClient }));

beforeEach(() => {
  vi.resetModules();
  createClient.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("contratos-db em modo demo (Supabase não configurado)", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  });

  it("getContratos retorna a carteira de demonstração sem chamar o Supabase", async () => {
    const { getContratos } = await import("./contratos-db");
    const { CONTRATOS } = await import("./contratos");

    const contratos = await getContratos();

    expect(contratos).toEqual(CONTRATOS);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("getContratoByRef retorna o contrato de demonstração correspondente", async () => {
    const { getContratoByRef } = await import("./contratos-db");
    const { CONTRATOS } = await import("./contratos");

    const contrato = await getContratoByRef(CONTRATOS[0].ref);

    expect(contrato).toEqual(CONTRATOS[0]);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("getDiagnosticoDb retorna o diagnóstico de demonstração", async () => {
    const { getDiagnosticoDb } = await import("./contratos-db");
    const { diagnostico } = await import("./contratos");

    const resultado = await getDiagnosticoDb();

    expect(resultado).toEqual(diagnostico());
    expect(createClient).not.toHaveBeenCalled();
  });
});
