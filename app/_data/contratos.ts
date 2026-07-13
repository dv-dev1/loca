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

export const CONTRATOS: Contrato[] = [
  {
    ref: "LOC-0388",
    anotacoes: [],
    tipo: "Residencial",
    imovel: "Casa · R. das Acácias, 120",
    endereco: "R. das Acácias, 120 — Jardim Sul",
    matricula: "44.812",
    iptu: "012.345.0001-7",
    locador: "Antônio Prado",
    locadorDoc: "123.456.789-00",
    locatario: "Família Ribeiro",
    locatarioDoc: "987.654.321-00",
    aluguel: "R$ 3.100",
    indice: "IGP-M",
    periodicidade: "Anual (12 meses)",
    vencimentoDia: "05",
    inicio: "jun/2024",
    fim: "jun/2026",
    garantia: "Fiador",
    evento: "vence",
    data: "15 jun 2026",
    tom: "perigo",
    regua: { inicio: "jun/24", reajuste: "jun/25", reajusteLabel: "IGP-M +3,8%", fim: "jun/26", pct: 50 },
    documentos: ["Contrato assinado.pdf", "Matrícula 44.812.pdf", "IPTU 2026.pdf"],
    reajustes: [{ data: "jun/2025", indice: "IGP-M +3,8%", de: "R$ 2.987", para: "R$ 3.100" }],
  },
  {
    ref: "LOC-0429",
    anotacoes: [],
    tipo: "Residencial",
    imovel: "Apto 302 · Ed. Aurora",
    endereco: "Av. Beira-Rio, 880, ap. 302 — Centro",
    matricula: "51.227",
    iptu: "045.118.0302-3",
    locador: "Helena Castro",
    locadorDoc: "111.222.333-44",
    locatario: "Marina Lopes",
    locatarioDoc: "555.666.777-88",
    aluguel: "R$ 2.498",
    indice: "IGP-M",
    periodicidade: "Anual (12 meses)",
    vencimentoDia: "10",
    inicio: "jan/2025",
    fim: "jan/2027",
    garantia: "Caução",
    evento: "vence",
    data: "30 jun 2026",
    tom: "atencao",
    regua: { inicio: "jan/25", reajuste: "set/26", reajusteLabel: "IGP-M +4,1%", fim: "jan/27", pct: 58 },
    documentos: ["Contrato assinado.pdf", "Matrícula 51.227.pdf"],
    reajustes: [{ data: "set/2026", indice: "IGP-M +4,1%", de: "R$ 2.400", para: "R$ 2.498" }],
  },
  {
    ref: "LOC-0411",
    anotacoes: [],
    tipo: "Comercial",
    imovel: "Sala 14 · Empresarial Norte",
    endereco: "R. do Comércio, 45, sala 14 — Norte",
    matricula: "38.904",
    iptu: "077.220.0014-9",
    locador: "Invest Norte Ltda.",
    locadorDoc: "12.345.678/0001-90",
    locatario: "Contábil Vega ME",
    locatarioDoc: "98.765.432/0001-10",
    aluguel: "R$ 5.387",
    indice: "IPCA",
    periodicidade: "Anual (12 meses)",
    vencimentoDia: "08",
    inicio: "jul/2023",
    fim: "jul/2027",
    garantia: "Seguro-fiança",
    evento: "reajuste",
    data: "13 jul 2026",
    tom: "ok",
    regua: { inicio: "jul/23", reajuste: "jul/26", reajusteLabel: "IPCA +3,6%", fim: "jul/27", pct: 75 },
    documentos: ["Contrato assinado.pdf", "Matrícula 38.904.pdf", "IPTU 2026.pdf", "Aditivo 01.pdf"],
    reajustes: [
      { data: "jul/2024", indice: "IPCA +4,2%", de: "R$ 4.980", para: "R$ 5.189" },
      { data: "jul/2025", indice: "IPCA +3,8%", de: "R$ 5.189", para: "R$ 5.387" },
    ],
  },
  {
    ref: "LOC-0356",
    anotacoes: [],
    tipo: "Comercial",
    imovel: "Loja 3 · Galeria Sul",
    endereco: "Galeria Sul, loja 3 — Centro",
    matricula: "29.551",
    iptu: "033.901.0003-1",
    locador: "Galeria Sul S.A.",
    locadorDoc: "11.222.333/0001-44",
    locatario: "Ótica Mirante",
    locatarioDoc: "22.333.444/0001-55",
    aluguel: "R$ 9.265",
    indice: "IGP-M",
    periodicidade: "Anual (12 meses)",
    vencimentoDia: "05",
    inicio: "fev/2024",
    fim: "fev/2027",
    garantia: "Fiador",
    evento: "vence",
    data: "19 jul 2026",
    tom: "ok",
    regua: { inicio: "fev/24", reajuste: "fev/26", reajusteLabel: "IGP-M +4,1%", fim: "fev/27", pct: 66 },
    documentos: ["Contrato assinado.pdf", "Matrícula 29.551.pdf"],
    reajustes: [{ data: "fev/2026", indice: "IGP-M +4,1%", de: "R$ 8.900", para: "R$ 9.265" }],
  },
  {
    ref: "LOC-0341",
    anotacoes: [],
    tipo: "Residencial",
    imovel: "Apto 71 · Ed. Cedro",
    endereco: "R. dos Pinhais, 200, ap. 71 — Leste",
    matricula: "60.103",
    iptu: "088.440.0071-2",
    locador: "Marcos Vasquez",
    locadorDoc: "222.333.444-55",
    locatario: "Bruno e Carla Tavares",
    locatarioDoc: "333.444.555-66",
    aluguel: "R$ 2.050",
    indice: "IPCA",
    periodicidade: "Anual (12 meses)",
    vencimentoDia: "15",
    inicio: "ago/2024",
    fim: "ago/2026",
    garantia: "Caução",
    evento: "reajuste",
    data: "02 ago 2026",
    tom: "ok",
    regua: { inicio: "ago/24", reajuste: "ago/25", reajusteLabel: "IPCA +3,5%", fim: "ago/26", pct: 50 },
    documentos: ["Contrato assinado.pdf"],
    reajustes: [{ data: "ago/2025", indice: "IPCA +3,5%", de: "R$ 1.981", para: "R$ 2.050" }],
  },
  {
    ref: "LOC-0312",
    anotacoes: [],
    tipo: "Residencial",
    imovel: "Casa · Al. dos Ipês, 45",
    endereco: "Al. dos Ipês, 45 — Jardim Botânico",
    matricula: "47.330",
    iptu: "021.770.0045-8",
    locador: "Sônia Albuquerque",
    locadorDoc: "444.555.666-77",
    locatario: "Renata Fagundes",
    locatarioDoc: "666.777.888-99",
    aluguel: "R$ 4.400",
    indice: "IGP-M",
    periodicidade: "Anual (12 meses)",
    vencimentoDia: "10",
    inicio: "set/2024",
    fim: "set/2026",
    garantia: "Seguro-fiança",
    evento: "vence",
    data: "28 ago 2026",
    tom: "ok",
    regua: { inicio: "set/24", reajuste: "set/25", reajusteLabel: "IGP-M +3,9%", fim: "set/26", pct: 50 },
    documentos: ["Contrato assinado.pdf", "Matrícula 47.330.pdf", "IPTU 2026.pdf"],
    reajustes: [{ data: "set/2025", indice: "IGP-M +3,9%", de: "R$ 4.235", para: "R$ 4.400" }],
  },
  {
    ref: "LOC-0298",
    anotacoes: [],
    tipo: "Comercial",
    imovel: "Conj. 9 · Torre Marília",
    endereco: "Av. das Torres, 1500, conj. 9 — Norte",
    matricula: "55.018",
    iptu: "099.330.0009-4",
    locador: "Torre Marília Empr.",
    locadorDoc: "33.444.555/0001-66",
    locatario: "Estúdio Norte Arq.",
    locatarioDoc: "44.555.666/0001-77",
    aluguel: "R$ 6.700",
    indice: "IPCA",
    periodicidade: "Anual (12 meses)",
    vencimentoDia: "07",
    inicio: "set/2023",
    fim: "set/2027",
    garantia: "Fiador",
    evento: "reajuste",
    data: "10 set 2026",
    tom: "ok",
    regua: { inicio: "set/23", reajuste: "set/26", reajusteLabel: "IPCA +3,6%", fim: "set/27", pct: 75 },
    documentos: ["Contrato assinado.pdf", "Matrícula 55.018.pdf", "Aditivo 01.pdf"],
    reajustes: [
      { data: "set/2024", indice: "IPCA +4,0%", de: "R$ 6.210", para: "R$ 6.460" },
      { data: "set/2025", indice: "IPCA +3,7%", de: "R$ 6.460", para: "R$ 6.700" },
    ],
  },
];

export function getContrato(ref: string): Contrato | undefined {
  return CONTRATOS.find((c) => c.ref.toLowerCase() === ref.toLowerCase());
}

export function brl(n: number): string {
  return "R$ " + n.toLocaleString("pt-BR");
}

/** Reajustes previstos e ainda não aplicados (dinheiro escapando todo mês). */
const ATRASADOS = [
  { ref: "LOC-0356", meses: 4, perdaMensal: 380, indice: "IGP-M +4,1%" },
  { ref: "LOC-0411", meses: 2, perdaMensal: 210, indice: "IPCA +3,6%" },
  { ref: "LOC-0298", meses: 5, perdaMensal: 240, indice: "IPCA +3,6%" },
];

export type Achado = Contrato & { meses: number; perdaMensal: number; perdaTotal: number; indiceAtraso: string };

export function diagnostico() {
  const atrasados: Achado[] = ATRASADOS.flatMap((a) => {
    const c = getContrato(a.ref);
    if (!c) return [];
    return [{ ...c, meses: a.meses, perdaMensal: a.perdaMensal, perdaTotal: a.meses * a.perdaMensal, indiceAtraso: a.indice }];
  });

  const deixadoNaMesa = atrasados.reduce((s, a) => s + a.perdaTotal, 0);
  const perdaMensalTotal = atrasados.reduce((s, a) => s + a.perdaMensal, 0);

  // vencimentos vencidos ou próximos
  const emRisco = CONTRATOS.filter((c) => c.tom !== "ok");
  // contratos sem o conjunto mínimo de documentos (contrato + matrícula + IPTU)
  const semDocs = CONTRATOS.filter((c) => c.documentos.length < 3);

  return {
    atrasados,
    deixadoNaMesa,
    perdaMensalTotal,
    emRisco,
    semDocs,
    totalContratos: CONTRATOS.length,
  };
}
