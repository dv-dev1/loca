import { describe, expect, it } from "vitest";
import { CONTRATOS } from "@/app/_data/contratos";
import { generateContratoPdf } from "./contrato";

describe("generateContratoPdf", () => {
  it("gera um PDF válido a partir dos dados do contrato", async () => {
    const bytes = await generateContratoPdf(CONTRATOS[0]);
    const header = Buffer.from(bytes.slice(0, 5)).toString("utf8");
    expect(header).toBe("%PDF-");
  });
});
