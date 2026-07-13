import { CONTRATOS } from "@/app/_data/contratos";
import { supabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { ConvidarForm, type ContratoOpcao } from "./ConvidarForm";

type Row = { ref: string; imovel: string; tipo: string; locador_user_id: string | null };

async function carregarContratos(): Promise<ContratoOpcao[]> {
  if (!supabaseConfigured) {
    return CONTRATOS.map((c) => ({ ref: c.ref, imovel: c.imovel, tipo: c.tipo, vinculado: false }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("contratos")
    .select("ref, imovel, tipo, locador_user_id")
    .order("imovel");

  return ((data as Row[] | null) ?? []).map((c) => ({
    ref: c.ref,
    imovel: c.imovel,
    tipo: c.tipo,
    vinculado: c.locador_user_id != null,
  }));
}

export default async function LocadoresPage() {
  const contratos = await carregarContratos();

  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">§ Locadores</p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">Acesso do locador</h1>
      <p className="mt-2 max-w-[52ch] text-ink-soft">
        Crie um e-mail e senha para o proprietário acompanhar os contratos dele. Ele verá apenas os imóveis
        marcados aqui, com o canal de WhatsApp da imobiliária.
      </p>

      <div className="mt-8">
        {contratos.length > 0 ? (
          <ConvidarForm contratos={contratos} />
        ) : (
          <p className="text-ink-soft">Cadastre contratos antes de convidar locadores.</p>
        )}
      </div>
    </div>
  );
}
