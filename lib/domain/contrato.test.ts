import { describe, expect, it } from "vitest";
import { brl } from "./contrato";

describe("brl", () => {
  it("formata um inteiro com o prefixo R$ e separador de milhar pt-BR", () => {
    expect(brl(3100)).toBe("R$ 3.100");
  });

  it("formata zero", () => {
    expect(brl(0)).toBe("R$ 0");
  });

  it("formata valores grandes com múltiplos separadores de milhar", () => {
    expect(brl(1234567)).toBe("R$ 1.234.567");
  });
});
