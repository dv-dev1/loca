import { describe, expect, it } from "vitest";
import {
  formatDataHora,
  formatMesAno,
  mesesEntre,
  parseMesAno,
  periodicidadeMeses,
  proximoReajuste,
} from "./datas";

describe("parseMesAno", () => {
  it("converte 'jun/2024' no primeiro dia do mês", () => {
    const d = parseMesAno("jun/2024");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(5); // junho = 5
    expect(d.getDate()).toBe(1);
  });

  it("entende todos os meses abreviados em pt-BR", () => {
    expect(parseMesAno("jan/2025").getMonth()).toBe(0);
    expect(parseMesAno("dez/2025").getMonth()).toBe(11);
    expect(parseMesAno("set/2023").getMonth()).toBe(8);
  });

  it("é tolerante a maiúsculas e espaços", () => {
    expect(parseMesAno(" JUN/2024 ").getMonth()).toBe(5);
  });
});

describe("formatMesAno", () => {
  it("é o inverso de parseMesAno", () => {
    expect(formatMesAno(parseMesAno("ago/2026"))).toBe("ago/2026");
  });
});

describe("periodicidadeMeses", () => {
  it("extrai o número de meses do rótulo", () => {
    expect(periodicidadeMeses("Anual (12 meses)")).toBe(12);
    expect(periodicidadeMeses("Semestral (6 meses)")).toBe(6);
  });

  it("assume 12 meses quando o rótulo não tem número", () => {
    expect(periodicidadeMeses("Anual")).toBe(12);
  });
});

describe("proximoReajuste", () => {
  const inicio = parseMesAno("jun/2024");

  it("retorna o primeiro aniversário anual a partir de hoje", () => {
    // hoje em mai/2026: o aniversário jun/2026 ainda não passou
    const d = proximoReajuste(inicio, 12, new Date(2026, 4, 10));
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
  });

  it("pula para o próximo ano quando o aniversário do ano já passou", () => {
    // hoje 26/jun/2026: jun/2026 já passou → próximo é jun/2027
    const d = proximoReajuste(inicio, 12, new Date(2026, 5, 26));
    expect(d.getFullYear()).toBe(2027);
    expect(d.getMonth()).toBe(5);
  });

  it("nunca retorna o próprio início (primeiro reajuste é após um período)", () => {
    const d = proximoReajuste(inicio, 12, new Date(2024, 5, 1));
    expect(d.getFullYear()).toBe(2025);
  });
});

describe("formatDataHora", () => {
  it("formata data e hora como dd/mm/aaaa HH:mm", () => {
    expect(formatDataHora(new Date(2026, 6, 13, 9, 5))).toBe("13/07/2026 09:05");
  });

  it("preenche com zero à esquerda dia, mês, hora e minuto", () => {
    expect(formatDataHora(new Date(2026, 0, 2, 3, 4))).toBe("02/01/2026 03:04");
  });
});

describe("mesesEntre", () => {
  it("conta meses cheios entre duas datas", () => {
    expect(mesesEntre(new Date(2026, 5, 1), new Date(2026, 7, 1))).toBe(2);
  });

  it("arredonda para baixo quando o dia ainda não chegou", () => {
    // de 26/jun a 10/ago = 1 mês cheio + alguns dias
    expect(mesesEntre(new Date(2026, 5, 26), new Date(2026, 7, 10))).toBe(1);
  });

  it("é negativo quando a data alvo já passou", () => {
    expect(mesesEntre(new Date(2026, 7, 1), new Date(2026, 5, 1))).toBe(-2);
  });
});
