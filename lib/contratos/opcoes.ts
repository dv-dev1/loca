// Fonte única para os enums do formulário de contrato — reaproveitados também
// pelo JSON Schema da extração automática via IA (lib/ia/extrair-contrato.ts),
// pra evitar as duas cópias saírem de sincronia.

export const TIPO_OPCOES = ["Residencial", "Comercial"] as const;
export const INDICE_OPCOES = ["IGP-M", "IPCA", "Índice fixo"] as const;
export const GARANTIA_OPCOES = [
  "Caução",
  "Fiador",
  "Seguro-fiança",
  "Título de capitalização",
] as const;
