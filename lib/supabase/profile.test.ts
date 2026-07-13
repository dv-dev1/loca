import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const from = vi.fn();

vi.mock("./server", () => ({
  createClient: async () => ({ auth: { getUser }, from }),
}));

beforeEach(() => {
  vi.resetModules();
  getUser.mockReset();
  from.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getProfile", () => {
  it("retorna perfil demo sem chamar o Supabase quando as chaves não estão configuradas", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const { getProfile } = await import("./profile");

    const profile = await getProfile();

    expect(profile).toEqual({ id: "demo", papel: "admin", nome: "Imobiliária Demo" });
    expect(getUser).not.toHaveBeenCalled();
  });

  it("consulta o Supabase normalmente quando configurado", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "chave");
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const single = vi.fn().mockResolvedValue({ data: { id: "u1", papel: "locador", nome: "Fulano" } });
    from.mockReturnValue({ select: () => ({ eq: () => ({ single }) }) });

    const { getProfile } = await import("./profile");
    const profile = await getProfile();

    expect(profile).toEqual({ id: "u1", papel: "locador", nome: "Fulano" });
    expect(getUser).toHaveBeenCalled();
  });
});
