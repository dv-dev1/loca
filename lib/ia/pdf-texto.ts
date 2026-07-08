// Extrai a camada de texto de um PDF. Isolado do restante da extração para
// (a) manter um seam testável (os testes mockam este módulo) e (b) conter o
// import de pdf-parse, que precisa vir do subcaminho `lib/` — o entrypoint
// padrão roda um bloco de debug que tenta ler um PDF de teste no momento do
// import e quebra fora de um contexto de módulo comum.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function extrairTextoDoPdf(buffer: Buffer): Promise<string> {
  const { text } = await pdfParse(buffer);
  return text ?? "";
}
