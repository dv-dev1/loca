import { describe, expect, it } from "vitest";
import { GET } from "./route";

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
