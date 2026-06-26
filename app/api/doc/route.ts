import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  const nome = req.nextUrl.searchParams.get("nome");

  if (!ref || !nome) {
    return NextResponse.json({ error: "ref e nome são obrigatórios" }, { status: 400 });
  }

  // Verifica autenticação.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const admin = createAdminClient();

  // Localiza o contrato pelo ref.
  const { data: contrato } = await admin
    .from("contratos")
    .select("id")
    .eq("ref", ref)
    .maybeSingle();

  if (contrato) {
    // Busca o storage_path do documento.
    const { data: doc } = await admin
      .from("documentos")
      .select("storage_path")
      .eq("contrato_id", (contrato as { id: string }).id)
      .eq("nome", nome)
      .maybeSingle();

    const path = (doc as { storage_path: string | null } | null)?.storage_path;

    if (path) {
      const { data: signed } = await admin.storage
        .from("documentos")
        .createSignedUrl(path, 3600); // 1 hora de validade

      if (signed?.signedUrl) {
        return NextResponse.redirect(signed.signedUrl);
      }
    }
  }

  // Fallback: redireciona para o PDF gerado do contrato.
  return NextResponse.redirect(new URL(`/contratos/${ref}/pdf`, req.url));
}
