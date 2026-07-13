import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockGetProfile = vi.fn();

type Contrato = { id: string; locador_user_id: string | null } | null;
type Doc = { storage_path: string | null } | null;

let contratoFixture: Contrato = null;
let docFixture: Doc = null;
let signedUrlFixture: string | null = null;

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock("@/lib/supabase/profile", () => ({
  getProfile: mockGetProfile,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "contratos") {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: contratoFixture }) }) }) };
      }
      if (table === "documentos") {
        return {
          select: () => ({
            eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: docFixture }) }) }),
          }),
        };
      }
      throw new Error(`tabela inesperada: ${table}`);
    },
    storage: {
      from: () => ({
        createSignedUrl: async () => ({ data: signedUrlFixture ? { signedUrl: signedUrlFixture } : null }),
      }),
    },
  }),
}));

const { GET } = await import("./route");

function req(ref: string, nome: string) {
  return new NextRequest(`http://localhost/api/doc?ref=${ref}&nome=${encodeURIComponent(nome)}`);
}

describe("GET /api/doc", () => {
  beforeEach(() => {
    contratoFixture = null;
    docFixture = null;
    signedUrlFixture = null;
    mockGetUser.mockReset();
    mockGetProfile.mockReset();
  });

  it("redireciona para /login se não houver usuário autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await GET(req("LOC-0001", "doc.pdf"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("não deixa um locador baixar documento de contrato que não é dele (IDOR)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-locador" } } });
    mockGetProfile.mockResolvedValue({ id: "user-locador", papel: "locador", nome: null });
    contratoFixture = { id: "contrato-1", locador_user_id: "outro-user" };
    docFixture = { storage_path: "LOC-0001/arquivo.pdf" };
    signedUrlFixture = "https://storage.example/signed-url-que-nao-deveria-vazar";

    const res = await GET(req("LOC-0001", "doc.pdf"));

    // Não autorizado: cai no fallback do PDF gerado, nunca na signed URL do storage real.
    expect(res.headers.get("location")).not.toBe(signedUrlFixture);
    expect(res.headers.get("location")).toContain("/contratos/LOC-0001/pdf");
  });

  it("permite o locador dono do contrato baixar o próprio documento", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-locador" } } });
    mockGetProfile.mockResolvedValue({ id: "user-locador", papel: "locador", nome: null });
    contratoFixture = { id: "contrato-1", locador_user_id: "user-locador" };
    docFixture = { storage_path: "LOC-0001/arquivo.pdf" };
    signedUrlFixture = "https://storage.example/signed-url-valida";

    const res = await GET(req("LOC-0001", "doc.pdf"));

    expect(res.headers.get("location")).toBe(signedUrlFixture);
  });

  it("permite o admin baixar documento de qualquer contrato", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-admin" } } });
    mockGetProfile.mockResolvedValue({ id: "user-admin", papel: "admin", nome: null });
    contratoFixture = { id: "contrato-1", locador_user_id: "outro-user" };
    docFixture = { storage_path: "LOC-0001/arquivo.pdf" };
    signedUrlFixture = "https://storage.example/signed-url-admin";

    const res = await GET(req("LOC-0001", "doc.pdf"));

    expect(res.headers.get("location")).toBe(signedUrlFixture);
  });
});
