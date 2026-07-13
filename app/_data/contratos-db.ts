import { type ContratoInput, type ReajusteInput, toContrato } from "@/lib/domain/contrato-view";
import { mesesEntre, periodicidadeMeses, proximoReajuste } from "@/lib/domain/datas";
import { supabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { type Achado, type Contrato, CONTRATOS, diagnostico, getContrato } from "./contratos";

type ReajusteRow = { data: string; indice: string; valor_anterior: number; valor_novo: number };
type DocRow = { nome: string };
type AnotacaoRow = { id: string; texto: string; created_at: string };
type ContratoRow = {
  ref: string;
  tipo: Contrato["tipo"];
  imovel: string;
  endereco: string | null;
  matricula: string | null;
  iptu: string | null;
  locador: string | null;
  locador_doc: string | null;
  locatario: string | null;
  locatario_doc: string | null;
  aluguel: number | string;
  indice: string | null;
  periodicidade: string | null;
  vencimento_dia: number | null;
  inicio: string | null;
  fim: string | null;
  garantia: string | null;
  reajustes: ReajusteRow[] | null;
  documentos: DocRow[] | null;
  anotacoes: AnotacaoRow[] | null;
};

// TODO: acrescentar ", anotacoes(id, texto, created_at)" assim que
// supabase/03_anotacoes.sql for rodado no projeto Supabase real.
const SELECT = "*, reajustes(data, indice, valor_anterior, valor_novo), documentos(nome)";

/** 'YYYY-MM-DD' → Date local (sem deslocar fuso). */
function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function rowToInput(row: ContratoRow): ContratoInput {
  const reajustes: ReajusteInput[] = (row.reajustes ?? [])
    .map((r) => ({ data: parseISO(r.data), indice: r.indice, de: Number(r.valor_anterior), para: Number(r.valor_novo) }))
    .sort((a, b) => a.data.getTime() - b.data.getTime());

  return {
    ref: row.ref,
    tipo: row.tipo,
    imovel: row.imovel,
    endereco: row.endereco ?? "",
    matricula: row.matricula ?? "—",
    iptu: row.iptu ?? "—",
    locador: row.locador ?? "—",
    locadorDoc: row.locador_doc ?? "—",
    locatario: row.locatario ?? "—",
    locatarioDoc: row.locatario_doc ?? "—",
    aluguel: Number(row.aluguel),
    indice: row.indice ?? "IGP-M",
    periodicidade: row.periodicidade ?? "Anual (12 meses)",
    vencimentoDia: row.vencimento_dia != null ? String(row.vencimento_dia) : "01",
    inicio: row.inicio ? parseISO(row.inicio) : new Date(),
    fim: row.fim ? parseISO(row.fim) : new Date(),
    garantia: row.garantia ?? "—",
    reajustes,
    documentos: (row.documentos ?? []).map((d) => d.nome),
    // TODO: mapear de row.anotacoes assim que a coluna estiver sendo buscada (ver SELECT acima).
    anotacoes: (row.anotacoes ?? []).map((a) => ({ id: a.id, texto: a.texto, criadoEm: new Date(a.created_at) })),
  };
}

async function loadInputs(): Promise<ContratoInput[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("contratos").select(SELECT).order("imovel");
  return ((data as ContratoRow[] | null) ?? []).map(rowToInput);
}

export async function getContratos(): Promise<Contrato[]> {
  if (!supabaseConfigured) return CONTRATOS;
  const hoje = new Date();
  return (await loadInputs()).map((i) => toContrato(i, hoje));
}

export async function getContratoByRef(ref: string): Promise<Contrato | undefined> {
  if (!supabaseConfigured) return getContrato(ref);
  const supabase = await createClient();
  const { data } = await supabase.from("contratos").select(SELECT).ilike("ref", ref).maybeSingle();
  if (!data) return undefined;
  return toContrato(rowToInput(data as ContratoRow), new Date());
}

/** Raio-X derivado de dados reais. Perda mensal é uma estimativa (índice médio anual). */
export async function getDiagnosticoDb() {
  if (!supabaseConfigured) return diagnostico();
  const hoje = new Date();
  const inputs = await loadInputs();
  const ESTIMATIVA_ANUAL = 0.045; // ~4,5% a.a. quando não há índice apurado registrado

  const atrasados: Achado[] = [];
  for (const i of inputs) {
    const meses = periodicidadeMeses(i.periodicidade);
    const prox = proximoReajuste(i.inicio, meses, hoje);
    const anterior = new Date(prox);
    anterior.setMonth(anterior.getMonth() - meses); // último aniversário (no passado)
    const atraso = mesesEntre(anterior, hoje);
    const jaAplicado = i.reajustes.some((r) => mesesEntre(r.data, anterior) === 0);
    if (atraso >= 1 && atraso <= 14 && anterior > i.inicio && !jaAplicado) {
      const perdaMensal = Math.round(i.aluguel * (ESTIMATIVA_ANUAL / 12) * meses);
      const c = toContrato(i, hoje);
      atrasados.push({ ...c, meses: atraso, perdaMensal, perdaTotal: atraso * perdaMensal, indiceAtraso: `${i.indice} (estimado)` });
    }
  }

  const contratos = inputs.map((i) => toContrato(i, hoje));
  return {
    atrasados,
    deixadoNaMesa: atrasados.reduce((s, a) => s + a.perdaTotal, 0),
    perdaMensalTotal: atrasados.reduce((s, a) => s + a.perdaMensal, 0),
    emRisco: contratos.filter((c) => c.tom !== "ok"),
    semDocs: contratos.filter((c) => c.documentos.length < 3),
    totalContratos: contratos.length,
  };
}
