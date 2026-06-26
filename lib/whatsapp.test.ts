import { describe, expect, it } from "vitest";
import { whatsappLink } from "./whatsapp";

describe("whatsappLink", () => {
  it("monta o link wa.me só com dígitos do telefone", () => {
    expect(whatsappLink("+55 (11) 99999-8888")).toBe("https://wa.me/5511999998888");
  });

  it("anexa a mensagem codificada quando informada", () => {
    expect(whatsappLink("5511999998888", "Olá, tudo bem?")).toBe(
      "https://wa.me/5511999998888?text=Ol%C3%A1%2C%20tudo%20bem%3F",
    );
  });

  it("retorna null quando não há telefone", () => {
    expect(whatsappLink(null)).toBeNull();
    expect(whatsappLink("")).toBeNull();
    expect(whatsappLink("   ")).toBeNull();
  });
});
