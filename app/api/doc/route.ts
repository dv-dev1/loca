import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/supabase/profile";

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

  const profile = await getProfile();
  const admin = createAdminClient();

  // Localiza o contrato pelo ref, dentro da org de quem pede. O admin client
  // ignora RLS de propósito (só ele gera signed URL de storage), então tanto o
  // escopo de org quanto a checagem de dono são refeitos aqui à mão.
  //
  // O filtro por org_id não é redundante com a checagem de papel abaixo: refs
  // são únicos por org (04_multi_tenant.sql), então LOC-0001 existe em várias
  // imobiliárias — sem ele, o ref buscado seria ambíguo e um admin da Projecta
  // baixaria o documento da Jampa apenas conhecendo o número.
  const { data: contrato } = profile?.orgId
    ? await admin
        .from("contratos")
        .select("id, locador_user_id")
        .eq("ref", ref)
        .eq("org_id", profile.orgId)
        .maybeSingle()
    : { data: null };

  const contratoTyped = contrato as { id: string; locador_user_id: string | null } | null;
  const autorizado =
    !!contratoTyped && (profile?.papel === "admin" || contratoTyped.locador_user_id === user.id);

  if (autorizado) {
    // Busca o storage_path do documento.
    const { data: doc } = await admin
      .from("documentos")
      .select("storage_path")
      .eq("contrato_id", contratoTyped.id)
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
  // req.nextUrl preserva o host do proxy (Cloudflare/ngrok) — req.url seria localhost.
  const fallback = req.nextUrl.clone();
  fallback.pathname = `/contratos/${ref}/pdf`;
  fallback.search = "";
  return NextResponse.redirect(fallback);
}
