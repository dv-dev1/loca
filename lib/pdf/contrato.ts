import { PDFDocument, rgb, StandardFonts, type PDFFont } from "pdf-lib";
import type { Contrato } from "@/app/_data/contratos";

export async function generateContratoPdf(c: Contrato): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;

  function line(text: string, size = 11, f: PDFFont = font, gap = 18) {
    page.drawText(text, { x: left, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
    y -= gap;
  }

  line(`Contrato ${c.ref}`, 18, bold, 28);
  line(c.imovel, 13, bold, 20);
  line(c.endereco, 11, font, 30);

  line("Partes", 13, bold, 20);
  line(`Locador: ${c.locador} (${c.locadorDoc})`);
  line(`Locatário: ${c.locatario} (${c.locatarioDoc})`, 11, font, 30);

  line("Locação", 13, bold, 20);
  line(`Aluguel: ${c.aluguel}`);
  line(`Índice de reajuste: ${c.indice}`);
  line(`Periodicidade: ${c.periodicidade}`);
  line(`Vigência: ${c.inicio} — ${c.fim}`);
  line(`Dia de vencimento: ${c.vencimentoDia}`);
  line(`Garantia: ${c.garantia}`);

  return doc.save();
}
