// Domínio puro de datas — sem dependências de framework/Supabase.
// Trabalha sobre os campos de texto dos contratos ("jun/2024", "Anual (12 meses)").

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "jun/2024" -> Date no primeiro dia do mês (horário local). */
export function parseMesAno(rotulo: string): Date {
  const [mes, ano] = rotulo.trim().toLowerCase().split("/");
  const idx = MESES.indexOf(mes);
  if (idx < 0) throw new Error(`Mês inválido em "${rotulo}"`);
  return new Date(Number(ano), idx, 1);
}

/** Date -> "jun/2024". */
export function formatMesAno(d: Date): string {
  return `${MESES[d.getMonth()]}/${d.getFullYear()}`;
}

/** "Anual (12 meses)" -> 12. Sem número explícito, assume 12. */
export function periodicidadeMeses(rotulo: string): number {
  const m = rotulo.match(/(\d+)\s*mes/i);
  return m ? Number(m[1]) : 12;
}

/**
 * Primeiro aniversário de reajuste (início + k·meses, k≥1) que cai em `hoje` ou depois.
 * O primeiro reajuste só ocorre após um período completo — nunca retorna o próprio início.
 */
export function proximoReajuste(inicio: Date, meses: number, hoje: Date): Date {
  const d = new Date(inicio);
  do {
    d.setMonth(d.getMonth() + meses);
  } while (d < hoje);
  return d;
}

/** Date -> "dd/mm/aaaa HH:mm" (horário local). */
export function formatDataHora(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`;
}

/** Meses cheios de `de` até `ate` (negativo se `ate` já passou). */
export function mesesEntre(de: Date, ate: Date): number {
  let meses = (ate.getFullYear() - de.getFullYear()) * 12 + (ate.getMonth() - de.getMonth());
  if (ate.getDate() < de.getDate()) meses -= 1;
  return meses;
}
