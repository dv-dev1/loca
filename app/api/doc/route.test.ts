import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockGetProfile = vi.fn();

type Contrato = { id: string; locador_user_id: string | null; org_id: string } | null;
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
        // Aplica os .eq() de verdade: a busca do contrato é escopada por org
        // (route.ts), então um filtro de org que não casa devolve null — é
        // assim que o admin de outra imobiliária não encontra o contrato.
        const filtros: Record<string, unknown> = {};
        const chain = {
          eq: (coluna: string, valor: unknown) => {
            filtros[coluna] = valor;
            return chain;
          },
          maybeSingle: async () => {
            if (!contratoFixture) return { data: null };
            const casa = Object.entries(filtros).every(
              ([coluna, valor]) =>
                coluna === "ref" || contratoFixture![coluna as keyof NonNullable<Contrato>] === valor,
            );
            return { data: casa ? contratoFixture : null };
          },
        };
        return { select: () => chain };
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
    mockGetProfile.mockResolvedValue({ id: "user-locador", papel: "locador", nome: null, orgId: "org-a" });
    contratoFixture = { id: "contrato-1", locador_user_id: "outro-user", org_id: "org-a" };
    docFixture = { storage_path: "org-a/LOC-0001/arquivo.pdf" };
    signedUrlFixture = "https://storage.example/signed-url-que-nao-deveria-vazar";

    const res = await GET(req("LOC-0001", "doc.pdf"));

    // Não autorizado: cai no fallback do PDF gerado, nunca na signed URL do storage real.
    expect(res.headers.get("location")).not.toBe(signedUrlFixture);
    expect(res.headers.get("location")).toContain("/contratos/LOC-0001/pdf");
  });

  it("permite o locador dono do contrato baixar o próprio documento", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-locador" } } });
    mockGetProfile.mockResolvedValue({ id: "user-locador", papel: "locador", nome: null, orgId: "org-a" });
    contratoFixture = { id: "contrato-1", locador_user_id: "user-locador", org_id: "org-a" };
    docFixture = { storage_path: "org-a/LOC-0001/arquivo.pdf" };
    signedUrlFixture = "https://storage.example/signed-url-valida";

    const res = await GET(req("LOC-0001", "doc.pdf"));

    expect(res.headers.get("location")).toBe(signedUrlFixture);
  });

  it("permite o admin baixar documento de contrato da sua imobiliária", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-admin" } } });
    mockGetProfile.mockResolvedValue({ id: "user-admin", papel: "admin", nome: null, orgId: "org-a" });
    contratoFixture = { id: "contrato-1", locador_user_id: "outro-user", org_id: "org-a" };
    docFixture = { storage_path: "org-a/LOC-0001/arquivo.pdf" };
    signedUrlFixture = "https://storage.example/signed-url-admin";

    const res = await GET(req("LOC-0001", "doc.pdf"));

    expect(res.headers.get("location")).toBe(signedUrlFixture);
  });

  it("não deixa um admin baixar documento de contrato de OUTRA imobiliária", async () => {
    // Admin da org-a tentando o documento de um contrato da org-b, sabendo o ref.
    // Este é o vazamento entre imobiliárias que o escopo por org fecha.
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-admin-a" } } });
    mockGetProfile.mockResolvedValue({ id: "user-admin-a", papel: "admin", nome: null, orgId: "org-a" });
    contratoFixture = { id: "contrato-da-org-b", locador_user_id: null, org_id: "org-b" };
    docFixture = { storage_path: "org-b/LOC-0001/arquivo.pdf" };
    signedUrlFixture = "https://storage.example/signed-url-da-org-b";

    const res = await GET(req("LOC-0001", "doc.pdf"));

    // O contrato não casa com org-a → cai no fallback, nunca na signed URL real.
    expect(res.headers.get("location")).not.toBe(signedUrlFixture);
    expect(res.headers.get("location")).toContain("/contratos/LOC-0001/pdf");
  });
});
