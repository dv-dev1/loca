import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn();

vi.mock("./server", () => ({ createClient }));

beforeEach(() => {
  vi.resetModules();
  createClient.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getOrgSettings", () => {
  it("retorna as configurações padrão sem chamar o Supabase quando não configurado", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const { getOrgSettings } = await import("./org");

    const org = await getOrgSettings();

    expect(org).toEqual({ nome: "Imobiliária", whatsapp: null, email: null });
    expect(createClient).not.toHaveBeenCalled();
  });
});
