import { NextResponse } from "next/server";
import { getContrato } from "@/app/_data/contratos";
import { generateContratoPdf } from "@/lib/pdf/contrato";

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const contrato = getContrato(decodeURIComponent(ref));

  if (!contrato) {
    return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  }

  const pdf = await generateContratoPdf(contrato);

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${contrato.ref}.pdf"`,
    },
  });
}
