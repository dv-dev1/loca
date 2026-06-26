import { describe, expect, it } from "vitest";
import { type ContratoInput, toContrato } from "./contrato-view";

const BASE: ContratoInput = {
  ref: "LOC-0001",
  tipo: "Residencial",
  imovel: "Casa",
  endereco: "Rua X, 1",
  matricula: "1",
  iptu: "1",
  locador: "Locador",
  locadorDoc: "000",
  locatario: "Locatário",
  locatarioDoc: "000",
  aluguel: 3100,
  indice: "IGP-M",
  periodicidade: "Anual (12 meses)",
  vencimentoDia: "05",
  inicio: new Date(2024, 0, 1),
  fim: new Date(2030, 0, 1),
  garantia: "Caução",
  reajustes: [],
  documentos: [],
};

function input(p: Partial<ContratoInput>): ContratoInput {
  return { ...BASE, ...p };
}

describe("toContrato", () => {
  it("formata aluguel e datas no shape de exibição", () => {
    const c = toContrato(input({}), new Date(2025, 5, 1));
    expect(c.aluguel).toBe("R$ 3.100");
    expect(c.inicio).toBe("jan/2024");
    expect(c.fim).toBe("jan/2030");
  });

  it("deriva evento/tom do próximo reajuste dentro da janela", () => {
    // reajuste jan/2026; hoje nov/2025 → 2 meses → atenção
    const c = toContrato(input({}), new Date(2025, 10, 1));
    expect(c.evento).toBe("reajuste");
    expect(c.tom).toBe("atencao");
    expect(c.data).toContain("jan 2026");
    expect(c.data).toContain("05");
  });

  it("usa tom ok quando não há evento na janela de antecedência", () => {
    // hoje jun/2025: reajuste jan/2026 (7 meses) fora da janela residencial
    const c = toContrato(input({}), new Date(2025, 5, 1));
    expect(c.tom).toBe("ok");
  });

  it("mapeia o histórico de reajustes com valores em BRL", () => {
    const c = toContrato(
      input({ reajustes: [{ data: new Date(2025, 5, 1), indice: "IGP-M +3,8%", de: 2987, para: 3100 }] }),
      new Date(2025, 5, 1),
    );
    expect(c.reajustes[0]).toEqual({ data: "jun/2025", indice: "IGP-M +3,8%", de: "R$ 2.987", para: "R$ 3.100" });
  });

  it("posiciona o reajuste na régua entre início e fim (0–100)", () => {
    // início jan/2024, fim jan/2026, reajuste jan/2025 → ~50%
    const c = toContrato(input({ fim: new Date(2026, 0, 1) }), new Date(2024, 0, 1));
    expect(c.regua.pct).toBeGreaterThanOrEqual(45);
    expect(c.regua.pct).toBeLessThanOrEqual(55);
  });
});
