import { describe, expect, it } from "vitest";
import { gerarSenha } from "./senha";

describe("gerarSenha", () => {
  it("retorna string de comprimento padrão 12", () => {
    expect(gerarSenha()).toHaveLength(12);
  });

  it("respeita comprimento customizado", () => {
    expect(gerarSenha(16)).toHaveLength(16);
  });

  it("contém ao menos uma letra maiúscula", () => {
    expect(gerarSenha()).toMatch(/[A-Z]/);
  });

  it("contém ao menos uma letra minúscula", () => {
    expect(gerarSenha()).toMatch(/[a-z]/);
  });

  it("contém ao menos um dígito", () => {
    expect(gerarSenha()).toMatch(/[0-9]/);
  });

  it("não contém caracteres ambíguos (0, 1, O, I, l, o, i)", () => {
    for (let n = 0; n < 50; n++) {
      expect(gerarSenha()).not.toMatch(/[01OIlio]/);
    }
  });

  it("gera senhas distintas em chamadas consecutivas", () => {
    const senhas = new Set(Array.from({ length: 20 }, () => gerarSenha()));
    expect(senhas.size).toBeGreaterThan(1);
  });
});
