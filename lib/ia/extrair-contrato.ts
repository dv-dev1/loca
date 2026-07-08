// Extração automática de dados de contrato a partir de um PDF, via Ollama Cloud
// (endpoint compatível com Chat Completions + Structured Outputs). O texto do PDF
// é extraído localmente (lib/ia/pdf-texto.ts) e enviado ao modelo. Nunca lança —
// qualquer falha (chave ausente, PDF sem texto, rede, JSON malformado) vira
// { ok: false, message } em pt-BR, para o formulário de cadastro degradar de
// volta ao preenchimento manual.

import OpenAI from "openai";
import { GARANTIA_OPCOES, INDICE_OPCOES, TIPO_OPCOES } from "@/lib/contratos/opcoes";
import { extrairTextoDoPdf } from "./pdf-texto";

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
const MENSAGEM_SEM_TEXTO =
  "Este PDF parece ser uma imagem/escaneado, sem texto legível. Preencha os campos manualmente.";

// Endpoint compatível com OpenAI do Ollama Cloud/Turbo; modelo forte em saída JSON.
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "https://ollama.com/v1";
const MODELO_PADRAO = "gpt-oss:120b";

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

// O endpoint do Ollama trata o json_schema como dica frouxa (chega a inventar
// nomes de chave), então o contrato de campos/valores vai explícito no prompt —
// é isto que garante a saída no formato de CampoContratoIA.
const PROMPT = `Você recebe o texto de um contrato de locação de imóvel brasileiro.
Responda APENAS com um objeto JSON contendo EXATAMENTE estas chaves (use null quando o dado não estiver claramente presente — nunca invente ou estime):
- "imovel": identificação curta do imóvel (string)
- "endereco": endereço completo do imóvel (string)
- "tipo": exatamente "Residencial" ou "Comercial"
- "matricula": número da matrícula do imóvel (string)
- "iptu": número de inscrição do IPTU (string)
- "locador": nome completo do locador/proprietário (string)
- "locadorDoc": CPF ou CNPJ do locador (string)
- "locatario": nome completo do locatário/inquilino (string)
- "locatarioDoc": CPF ou CNPJ do locatário (string)
- "aluguel": valor mensal, só dígitos e ponto decimal, ex "3100.00" (string, sem "R$" e sem separador de milhar)
- "indice": exatamente "IGP-M", "IPCA" ou "Índice fixo"
- "inicio": data de início da vigência no formato yyyy-mm-dd (string)
- "fim": data de fim da vigência no formato yyyy-mm-dd (string)
- "vencimentoDia": dia do mês do vencimento, só dígitos, ex "5" (string)
- "garantia": exatamente "Caução", "Fiador", "Seguro-fiança" ou "Título de capitalização"
Não inclua nenhuma outra chave. Não escreva texto fora do JSON.`;

let clientSingleton: OpenAI | null = null;
function getClient(): OpenAI {
  if (!clientSingleton) {
    clientSingleton = new OpenAI({
      apiKey: process.env.OLLAMA_API_KEY,
      baseURL: OLLAMA_BASE_URL,
    });
  }
  return clientSingleton;
}

export async function extrairContratoDoPdf(args: {
  buffer: Buffer;
  filename: string;
}): Promise<ExtrairContratoResultado> {
  if (!process.env.OLLAMA_API_KEY) {
    return { ok: false, message: MENSAGEM_INDISPONIVEL };
  }

  // 1. Extrai a camada de texto do PDF localmente (Ollama não ingere PDF cru).
  let texto: string;
  try {
    texto = await extrairTextoDoPdf(args.buffer);
  } catch (err) {
    console.error("Falha ao ler o texto do PDF:", err);
    return { ok: false, message: MENSAGEM_FALHA };
  }

  if (!texto.trim()) {
    return { ok: false, message: MENSAGEM_SEM_TEXTO };
  }

  // 2. Manda o texto ao modelo pedindo saída estruturada conforme o schema.
  try {
    const response = await getClient().chat.completions.create({
      model: process.env.OLLAMA_MODEL || MODELO_PADRAO,
      messages: [
        { role: "system", content: PROMPT },
        { role: "user", content: `Contrato:\n\n${texto}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "contrato_extraido", schema: SCHEMA, strict: true },
      },
    });

    const conteudo = response.choices[0]?.message?.content;
    if (!conteudo) return { ok: false, message: MENSAGEM_FALHA };

    const dados = JSON.parse(conteudo) as CampoContratoIA;
    return { ok: true, dados };
  } catch (err) {
    console.error("Falha ao extrair contrato via IA:", err);
    return { ok: false, message: MENSAGEM_FALHA };
  }
}
