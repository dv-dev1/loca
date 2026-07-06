// Extração automática de dados de contrato a partir de um PDF, via OpenAI
// (Responses API + Structured Outputs). Nunca lança — qualquer falha (chave
// ausente, rede, JSON malformado) vira { ok: false, message } em pt-BR, para
// o formulário de cadastro degradar de volta ao preenchimento manual.

import OpenAI from "openai";
import { GARANTIA_OPCOES, INDICE_OPCOES, TIPO_OPCOES } from "@/lib/contratos/opcoes";

export type CampoContratoIA = {
  imovel: string | null;
  endereco: string | null;
  tipo: (typeof TIPO_OPCOES)[number] | null;
  matricula: string | null;
  iptu: string | null;
  locador: string | null;
  locadorDoc: string | null;
  locatario: string | null;
  locatarioDoc: string | null;
  aluguel: string | null;
  indice: (typeof INDICE_OPCOES)[number] | null;
  inicio: string | null;
  fim: string | null;
  vencimentoDia: string | null;
  garantia: (typeof GARANTIA_OPCOES)[number] | null;
};

export type ExtrairContratoResultado =
  | { ok: true; dados: CampoContratoIA }
  | { ok: false; message: string };

const MENSAGEM_INDISPONIVEL = "Extração automática indisponível — preencha os campos manualmente.";
const MENSAGEM_FALHA = "Não foi possível ler o PDF agora. Preencha os campos manualmente.";

function campoEnum(opcoes: readonly string[], descricao: string) {
  return { type: ["string", "null"], enum: [...opcoes, null], description: descricao };
}

const SCHEMA = {
  type: "object",
  properties: {
    imovel: { type: ["string", "null"], description: "Identificação do imóvel (ex.: 'Casa · R. das Acácias, 120')." },
    endereco: { type: ["string", "null"], description: "Endereço completo do imóvel." },
    tipo: campoEnum(TIPO_OPCOES, "Tipo do contrato."),
    matricula: { type: ["string", "null"], description: "Número da matrícula do imóvel." },
    iptu: { type: ["string", "null"], description: "Número de inscrição do IPTU." },
    locador: { type: ["string", "null"], description: "Nome completo do locador (proprietário)." },
    locadorDoc: { type: ["string", "null"], description: "CPF ou CNPJ do locador." },
    locatario: { type: ["string", "null"], description: "Nome completo do locatário (inquilino)." },
    locatarioDoc: { type: ["string", "null"], description: "CPF ou CNPJ do locatário." },
    aluguel: { type: ["string", "null"], description: "Valor do aluguel mensal, só dígitos e ponto decimal (ex.: '3100.00'), sem 'R$' e sem separador de milhar." },
    indice: campoEnum(INDICE_OPCOES, "Índice de reajuste."),
    inicio: { type: ["string", "null"], description: "Data de início da vigência, formato yyyy-mm-dd." },
    fim: { type: ["string", "null"], description: "Data de fim da vigência, formato yyyy-mm-dd." },
    vencimentoDia: { type: ["string", "null"], description: "Dia do mês de vencimento do aluguel, só dígitos (ex.: '10')." },
    garantia: campoEnum(GARANTIA_OPCOES, "Tipo de garantia locatícia."),
  },
  required: [
    "imovel", "endereco", "tipo", "matricula", "iptu",
    "locador", "locadorDoc", "locatario", "locatarioDoc",
    "aluguel", "indice", "inicio", "fim", "vencimentoDia", "garantia",
  ],
  additionalProperties: false,
} as const;

const PROMPT = `Você recebe um contrato de locação de imóvel brasileiro em PDF. Extraia os campos pedidos no schema.
Regras:
- Se um campo não estiver claramente presente no documento, retorne null para ele — nunca invente ou estime valores.
- Datas ("inicio", "fim") devem vir no formato yyyy-mm-dd.
- "aluguel" e "vencimentoDia" devem vir só como dígitos (e ponto decimal no caso do aluguel), sem "R$", sem separador de milhar, sem vírgula decimal.
- "tipo", "indice" e "garantia" devem usar exatamente um dos valores permitidos no schema, ou null se não for possível determinar com confiança.`;

let clientSingleton: OpenAI | null = null;
function getClient(): OpenAI {
  if (!clientSingleton) clientSingleton = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return clientSingleton;
}

export async function extrairContratoDoPdf(args: {
  buffer: Buffer;
  filename: string;
}): Promise<ExtrairContratoResultado> {
  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, message: MENSAGEM_INDISPONIVEL };
  }

  try {
    const response = await getClient().responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              filename: args.filename,
              file_data: `data:application/pdf;base64,${args.buffer.toString("base64")}`,
            },
            { type: "input_text", text: PROMPT },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "contrato_extraido",
          schema: SCHEMA,
          strict: true,
        },
      },
    });

    const dados = JSON.parse(response.output_text) as CampoContratoIA;
    return { ok: true, dados };
  } catch (err) {
    console.error("Falha ao extrair contrato via IA:", err);
    return { ok: false, message: MENSAGEM_FALHA };
  }
}
