// Domínio puro de alertas — sem dependências de framework/Supabase.
// Regra de antecedência (em meses) por tipo de contrato e evento.

import type { Contrato, Tipo } from "./contrato";
import { mesesEntre, parseMesAno, periodicidadeMeses, proximoReajuste } from "./datas";

export type TipoAlerta = "reajuste" | "vencimento";
export type Severidade = "info" | "atencao" | "perigo";

export type Alerta = {
  ref: string;
  contrato: Contrato;
  tipo: TipoAlerta;
  data: Date;
  mesesRestantes: number;
  /** marco da régua de antecedência atingido (ex.: 8, 6 ou 2). */
  marco: number;
  severidade: Severidade;
};

/** Marcos de antecedência (em meses) por evento e tipo de contrato. */
const MARCOS: Record<TipoAlerta, Record<Tipo, number[]>> = {
  reajuste: {
    Residencial: [2, 1],
    Comercial: [2, 1],
  },
  vencimento: {
    // janela da ação renovatória no comercial (Lei do Inquilinato, art. 51)
    Residencial: [2, 1],
    Comercial: [8, 6, 2],
  },
};

function avaliar(
  ref: string,
  contrato: Contrato,
  tipo: TipoAlerta,
  data: Date,
  hoje: Date,
): Alerta | null {
  const marcos = MARCOS[tipo][contrato.tipo];
  const asc = [...marcos].sort((a, b) => a - b);
  const mesesRestantes = mesesEntre(hoje, data);

  // fora da janela: já passou ou ainda muito longe
  if (mesesRestantes < 0 || mesesRestantes > asc[asc.length - 1]) return null;

  const marco = asc.find((m) => m >= mesesRestantes) ?? asc[asc.length - 1];

  let severidade: Severidade;
  if (mesesRestantes <= asc[0]) severidade = "perigo";
  else if (asc.length > 1 && mesesRestantes <= asc[1]) severidade = "atencao";
  else severidade = asc.length > 1 ? "info" : "atencao";

  return { ref, contrato, tipo, data, mesesRestantes, marco, severidade };
}

export function alertasDoContrato(c: Contrato, hoje: Date): Alerta[] {
  const out: Alerta[] = [];

  const dataReajuste = proximoReajuste(parseMesAno(c.inicio), periodicidadeMeses(c.periodicidade), hoje);
  const reaj = avaliar(c.ref, c, "reajuste", dataReajuste, hoje);
  if (reaj) out.push(reaj);

  const venc = avaliar(c.ref, c, "vencimento", parseMesAno(c.fim), hoje);
  if (venc) out.push(venc);

  return out;
}

export function alertasDaCarteira(contratos: Contrato[], hoje: Date): Alerta[] {
  return contratos
    .flatMap((c) => alertasDoContrato(c, hoje))
    .sort((a, b) => a.mesesRestantes - b.mesesRestantes);
}
