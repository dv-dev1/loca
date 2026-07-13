// Tipos e formatação de exibição do Contrato. Vive em lib/domain/ (não em
// app/_data/) porque o resto de lib/domain/ depende destes tipos e da lógica
// de formatação — mantê-los em app/_data/ inverteria a dependência que a
// arquitetura do projeto define (app/ → app/_data/ → lib/domain/).

export type Tipo = "Residencial" | "Comercial";
export type Tom = "ok" | "atencao" | "perigo";

export type Reajuste = { data: string; indice: string; de: string; para: string };
export type Anotacao = { id: string; texto: string; criadoEm: string };

export type Contrato = {
  ref: string;
  tipo: Tipo;
  imovel: string;
  endereco: string;
  matricula: string;
  iptu: string;
  locador: string;
  locadorDoc: string;
  locatario: string;
  locatarioDoc: string;
  aluguel: string;
  indice: string;
  periodicidade: string;
  vencimentoDia: string;
  inicio: string;
  fim: string;
  garantia: string;
  /** próximo evento (lista) */
  evento: "vence" | "reajuste";
  data: string;
  tom: Tom;
  /** régua do tempo */
  regua: { inicio: string; reajuste: string; reajusteLabel: string; fim: string; pct: number };
  documentos: string[];
  reajustes: Reajuste[];
  anotacoes: Anotacao[];
};

export function brl(n: number): string {
  return "R$ " + n.toLocaleString("pt-BR");
}
