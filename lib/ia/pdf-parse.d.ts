// pdf-parse é importado pelo subcaminho lib/ (ver pdf-texto.ts); @types/pdf-parse
// só declara o entrypoint padrão, então reaproveitamos o tipo aqui.
declare module "pdf-parse/lib/pdf-parse.js" {
  import pdf from "pdf-parse";
  export default pdf;
}
