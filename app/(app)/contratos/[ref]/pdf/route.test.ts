import { describe, expect, it, vi } from "vitest";
import { CONTRATOS } from "@/app/_data/contratos";

// A rota lê do banco; aqui mockamos o loader para testar só o comportamento HTTP.
vi.mock("@/app/_data/contratos-db", () => ({
  getContratoByRef: vi.fn(async (ref: string) =>
    CONTRATOS.find((c) => c.ref.toLowerCase() === ref.toLowerCase()),
  ),
}));

const { GET } = await import("./route");

describe("GET /contratos/[ref]/pdf", () => {
  it("retorna um PDF para um contrato existente", async () => {
    const res = await GET(new Request("http://localhost/contratos/LOC-0388/pdf"), {
      params: Promise.resolve({ ref: "LOC-0388" }),
    });

    expect(res.headers.get("content-type")).toBe("application/pdf");
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });

  it("retorna 404 para um contrato inexistente", async () => {
    const res = await GET(new Request("http://localhost/contratos/XXX/pdf"), {
      params: Promise.resolve({ ref: "XXX" }),
    });

    expect(res.status).toBe(404);
  });
});
