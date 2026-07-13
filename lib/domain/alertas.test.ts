import { describe, expect, it } from "vitest";
import type { Contrato } from "./contrato";
import { alertasDaCarteira, alertasDoContrato } from "./alertas";

const BASE: Contrato = {
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
  aluguel: "R$ 1.000",
  indice: "IGP-M",
  periodicidade: "Anual (12 meses)",
  vencimentoDia: "05",
  inicio: "jan/2024",
  fim: "jan/2030",
  garantia: "Caução",
  evento: "vence",
  data: "—",
  tom: "ok",
  regua: { inicio: "jan/24", reajuste: "jan/25", reajusteLabel: "—", fim: "jan/30", pct: 50 },
  documentos: [],
  reajustes: [],
  anotacoes: [],
};

function contrato(p: Partial<Contrato>): Contrato {
  return { ...BASE, ...p };
}

describe("alertasDoContrato — reajuste", () => {
  // início jan/2024, anual → aniversário jan/2026
  it("residencial a 2 meses do reajuste → atenção, marco 2", () => {
    const c = contrato({ inicio: "jan/2024", fim: "jan/2030" });
    const alertas = alertasDoContrato(c, new Date(2025, 10, 1)); // nov/2025
    const reaj = alertas.find((a) => a.tipo === "reajuste");
    expect(reaj).toBeDefined();
    expect(reaj!.mesesRestantes).toBe(2);
    expect(reaj!.marco).toBe(2);
    expect(reaj!.severidade).toBe("atencao");
  });

  it("residencial a 1 mês do reajuste → perigo", () => {
    const c = contrato({ inicio: "jan/2024", fim: "jan/2030" });
    const alertas = alertasDoContrato(c, new Date(2025, 11, 1)); // dez/2025
    const reaj = alertas.find((a) => a.tipo === "reajuste");
    expect(reaj!.severidade).toBe("perigo");
  });

  it("residencial a 4 meses do reajuste → nenhum alerta de reajuste", () => {
    const c = contrato({ inicio: "jan/2024", fim: "jan/2030" });
    const alertas = alertasDoContrato(c, new Date(2025, 8, 1)); // set/2025
    expect(alertas.find((a) => a.tipo === "reajuste")).toBeUndefined();
  });
});

describe("alertasDoContrato — vencimento (residencial vs comercial)", () => {
  it("residencial a 7 meses do fim → NÃO alerta (janela é só 2/1)", () => {
    // reajuste em jan não interfere em fev/2026 (próximo é jan/2027)
    const c = contrato({ tipo: "Residencial", inicio: "jan/2024", fim: "set/2026" });
    const alertas = alertasDoContrato(c, new Date(2026, 1, 1)); // fev/2026
    expect(alertas.find((a) => a.tipo === "vencimento")).toBeUndefined();
  });

  it("comercial a 7 meses do fim → alerta (janela 8/6/2), marco 8", () => {
    const c = contrato({ tipo: "Comercial", inicio: "jan/2024", fim: "set/2026" });
    const alertas = alertasDoContrato(c, new Date(2026, 1, 1)); // fev/2026
    const venc = alertas.find((a) => a.tipo === "vencimento");
    expect(venc).toBeDefined();
    expect(venc!.mesesRestantes).toBe(7);
    expect(venc!.marco).toBe(8);
    expect(venc!.severidade).toBe("info");
  });

  it("comercial a 2 meses do fim → perigo, marco 2", () => {
    const c = contrato({ tipo: "Comercial", inicio: "jan/2024", fim: "set/2026" });
    const alertas = alertasDoContrato(c, new Date(2026, 6, 1)); // jul/2026
    const venc = alertas.find((a) => a.tipo === "vencimento");
    expect(venc!.severidade).toBe("perigo");
    expect(venc!.marco).toBe(2);
  });
});

describe("alertasDaCarteira", () => {
  it("agrega e ordena por urgência (menos meses primeiro)", () => {
    const cs = [
      contrato({ ref: "A", tipo: "Comercial", inicio: "jan/2024", fim: "set/2026" }), // venc 7m
      contrato({ ref: "B", tipo: "Residencial", inicio: "jan/2024", fim: "mar/2026" }), // venc 1m
    ];
    const alertas = alertasDaCarteira(cs, new Date(2026, 1, 1)); // fev/2026
    expect(alertas.length).toBeGreaterThanOrEqual(2);
    expect(alertas[0].mesesRestantes).toBeLessThanOrEqual(alertas[1].mesesRestantes);
  });
});
