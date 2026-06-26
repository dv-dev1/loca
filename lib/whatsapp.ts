/** Monta o link wa.me a partir de um telefone livre. Null se não houver número. */
export function whatsappLink(phone: string | null | undefined, message?: string): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
