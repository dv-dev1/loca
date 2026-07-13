// Mapeia dados reais do banco para o shape de exibição `Contrato`,
// derivando evento/data/tom/régua das datas. Puro — sem Supabase/React.

import { type Contrato, type Tom, brl } from "./contrato";
import { type Severidade, alertasDoContrato } from "./alertas";
import { formatDataHora, formatMesAno, periodicidadeMeses, proximoReajuste } from "./datas";

const MES3 = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEV_TOM: Record<Severidade, Tom> = { perigo: "perigo", atencao: "atencao", info: "ok" };

export type ReajusteInput = { data: Date; indice: string; de: number; para: number };
export type AnotacaoInput = { id: string; texto: string; criadoEm: Date };

export type ContratoInput = {
  ref: string;
  tipo: Contrato["tipo"];
  imovel: string;
  endereco: string;
  matricula: string;
  iptu: string;
  locador: string;
  locadorDoc: string;
  locatario: string;
  locatarioDoc: string;
  aluguel: number;
  indice: string;
  periodicidade: string;
  vencimentoDia: string;
  inicio: Date;
  fim: Date;
  garantia: string;
  reajustes: ReajusteInput[];
  documentos: string[];
  anotacoes: AnotacaoInput[];
};

function curto(d: Date): string {
  return `${MES3[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}

function diaMesAno(d: Date, dia: string): string {
  const dd = String(dia ?? "").padStart(2, "0") || "01";
  return `${dd} ${MES3[d.getMonth()]} ${d.getFullYear()}`;
}

export function toContrato(i: ContratoInput, hoje: Date): Contrato {
  const meses = periodicidadeMeses(i.periodicidade);
  const reaj = proximoReajuste(i.inicio, meses, hoje);

  const c: Contrato = {
    ref: i.ref,
    tipo: i.tipo,
    imovel: i.imovel,
    endereco: i.endereco,
    matricula: i.matricula,
    iptu: i.iptu,
    locador: i.locador,
    locadorDoc: i.locadorDoc,
    locatario: i.locatario,
    locatarioDoc: i.locatarioDoc,
    aluguel: brl(i.aluguel),
    indice: i.indice,
    periodicidade: i.periodicidade,
    vencimentoDia: i.vencimentoDia,
    inicio: formatMesAno(i.inicio),
    fim: formatMesAno(i.fim),
    garantia: i.garantia,
    evento: "vence",
    data: "",
    tom: "ok",
    regua: {
      inicio: curto(i.inicio),
      reajuste: curto(reaj),
      reajusteLabel: i.reajustes.at(-1)?.indice ?? i.indice,
      fim: curto(i.fim),
      pct: 50,
    },
    documentos: i.documentos,
    reajustes: i.reajustes.map((r) => ({
      data: formatMesAno(r.data),
      indice: r.indice,
      de: brl(r.de),
      para: brl(r.para),
    })),
    anotacoes: [...i.anotacoes]
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
      .map((a) => ({ id: a.id, texto: a.texto, criadoEm: formatDataHora(a.criadoEm) })),
  };

  // Próximo evento: usa o alerta mais urgente (se houver) ou o próximo cronológico.
  const ev = alertasDoContrato(c, hoje)[0];
  if (ev) {
    c.evento = ev.tipo === "vencimento" ? "vence" : "reajuste";
    c.data = diaMesAno(ev.data, i.vencimentoDia);
    c.tom = SEV_TOM[ev.severidade];
  } else {
    const proximoReaj = reaj <= i.fim;
    c.evento = proximoReaj ? "reajuste" : "vence";
    c.data = diaMesAno(proximoReaj ? reaj : i.fim, i.vencimentoDia);
  }

  // Posição do reajuste na régua do tempo.
  const span = i.fim.getTime() - i.inicio.getTime();
  c.regua.pct =
    span > 0
      ? Math.min(100, Math.max(0, Math.round(((reaj.getTime() - i.inicio.getTime()) / span) * 100)))
      : 50;

  return c;
}
