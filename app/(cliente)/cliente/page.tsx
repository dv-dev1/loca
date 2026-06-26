import { type Contrato, brl } from "@/app/_data/contratos";
import { WhatsappButton } from "@/app/_components/whatsapp-button";
import { type Severidade, alertasDoContrato } from "@/lib/domain/alertas";
import { formatMesAno } from "@/lib/domain/datas";
import { getOrgSettings } from "@/lib/supabase/org";
import { createClient } from "@/lib/supabase/server";

type Row = {
  ref: string;
  tipo: Contrato["tipo"];
  imovel: string;
  endereco: string | null;
  aluguel: number | string;
  indice: string | null;
  periodicidade: string | null;
  inicio: string | null;
  fim: string | null;
  status: string;
};

const TXT: Record<Severidade, string> = {
  perigo: "text-danger",
  atencao: "text-accent-2",
  info: "text-ink-soft",
};

/** 'YYYY-MM-DD' → "mmm/yyyy" (sem deslocar fuso). */
function ymLabel(date: string | null): string {
  if (!date) return "—";
  const [y, m] = date.split("-").map(Number);
  return formatMesAno(new Date(y, (m ?? 1) - 1, 1));
}

function proximoEvento(row: Row, hoje: Date) {
  // Sem datas de início/fim não há como calcular eventos.
  if (!row.inicio || !row.fim) return null;
  const fake = {
    ref: row.ref,
    tipo: row.tipo,
    inicio: ymLabel(row.inicio),
    fim: ymLabel(row.fim),
    periodicidade: row.periodicidade ?? "Anual (12 meses)",
  } as Contrato;
  return alertasDoContrato(fake, hoje)[0] ?? null;
}

export default async function PortalLocadorPage() {
  const supabase = await createClient();
  const org = await getOrgSettings();
  const { data } = await supabase
    .from("contratos")
    .select("ref, tipo, imovel, endereco, aluguel, indice, periodicidade, inicio, fim, status")
    .order("imovel");
  const contratos = (data as Row[] | null) ?? [];
  const hoje = new Date();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">{org.nome}</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.02em]">
          {contratos.length > 0
            ? contratos.length === 1
              ? "Seu imóvel"
              : "Seus imóveis"
            : "Bem-vindo"}
        </h1>
        <p className="mt-3 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
          Acompanhe a locação dos seus imóveis e fale direto com a {org.nome} quando precisar.
        </p>
      </header>

      {contratos.length > 0 ? (
        <ul className="flex flex-col">
          {contratos.map((c) => {
            const ev = proximoEvento(c, hoje);
            return (
              <li key={c.ref} className="border-t border-line py-6 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{c.imovel}</div>
                    {c.endereco && (
                      <div className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">{c.endereco}</div>
                    )}
                  </div>
                  <div className="text-right font-mono text-sm">
                    <div className="font-semibold">{brl(Number(c.aluguel))}</div>
                    <div className="text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">{c.tipo}</div>
                  </div>
                </div>
                <div className="mt-3 font-mono text-sm">
                  {ev ? (
                    <span className={TXT[ev.severidade]}>
                      {ev.tipo === "reajuste" ? "Reajuste" : "Vencimento"}{" "}
                      {ev.mesesRestantes <= 0 ? "neste mês" : ev.mesesRestantes === 1 ? "em 1 mês" : `em ${ev.mesesRestantes} meses`}
                      <span className="text-ink-faint"> · {formatMesAno(ev.data)}</span>
                    </span>
                  ) : (
                    <span className="text-ink-soft">Contrato em dia</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-ink-soft">
          Você ainda não tem imóveis vinculados a este acesso. Fale com a {org.nome} para regularizar.
        </p>
      )}

      <div className="border-t border-line pt-8">
        <WhatsappButton
          phone={org.whatsapp}
          message={`Olá, ${org.nome}. Sou locador e gostaria de falar sobre meu contrato.`}
        />
        {!org.whatsapp && (
          <p className="text-sm text-ink-soft">O canal de WhatsApp ainda não foi configurado pela imobiliária.</p>
        )}
      </div>
    </div>
  );
}
