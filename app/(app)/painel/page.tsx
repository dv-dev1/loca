import Link from "next/link";
import { brl } from "@/app/_data/contratos";
import { getContratos } from "@/app/_data/contratos-db";
import { type Severidade, alertasDaCarteira } from "@/lib/domain/alertas";
import { formatMesAno } from "@/lib/domain/datas";

const DOT: Record<Severidade, string> = { perigo: "bg-danger", atencao: "bg-accent", info: "bg-ink/40" };
const TXT: Record<Severidade, string> = { perigo: "text-danger", atencao: "text-accent-2", info: "text-ink-soft" };

function prazo(meses: number): string {
  if (meses <= 0) return "neste mês";
  if (meses === 1) return "em 1 mês";
  return `em ${meses} meses`;
}

function valor(aluguel: string): number {
  return Number(aluguel.replace(/\D/g, "")) || 0;
}

export default async function PainelPage() {
  const contratos = await getContratos();
  const hoje = new Date();
  const alertas = alertasDaCarteira(contratos, hoje);
  const vencimentos = alertas.filter((a) => a.tipo === "vencimento");
  const reajustes = alertas.filter((a) => a.tipo === "reajuste");
  const sobGestao = contratos.reduce((s, c) => s + valor(c.aluguel), 0);

  const stats = [
    { n: String(contratos.length), l: "contratos ativos" },
    { n: String(vencimentos.length), l: "vencimentos a caminho", tone: vencimentos.length > 0 ? "accent" : undefined },
    { n: String(reajustes.length), l: "reajustes na janela" },
    { n: brl(sobGestao), l: "aluguel sob gestão / mês" },
  ];

  return (
    <div className="flex flex-col gap-14">
      <section className="grid grid-cols-2 border-y border-ink/15 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.l}
            className={`py-7 ${i % 2 !== 0 ? "border-l border-line pl-6" : ""} lg:border-l lg:pl-6 ${i === 0 ? "lg:border-l-0 lg:pl-0" : ""} ${i < 2 ? "border-b border-line lg:border-b-0" : ""} ${i === 0 ? "pl-0" : ""}`}
          >
            <div className={`font-display text-[clamp(1.7rem,2.6vw,2.3rem)] font-bold tracking-tight ${s.tone === "accent" ? "text-accent-2" : "text-ink"}`}>
              {s.n}
            </div>
            <div className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-faint">{s.l}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr]">
        <section>
          <div className="flex items-end justify-between border-b border-ink/80 pb-4">
            <h2 className="font-display text-xl font-bold tracking-tight">Próximos vencimentos</h2>
            <Link href="/carteira" className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink">
              Ver carteira →
            </Link>
          </div>
          {vencimentos.length > 0 ? (
            <ul>
              {vencimentos.slice(0, 6).map((v) => (
                <li key={`${v.ref}-venc`}>
                  <Link href={`/contratos/${v.ref}`} className="flex items-center gap-4 border-b border-line py-4 transition hover:bg-paper-2">
                    <span className={`size-2 shrink-0 ${DOT[v.severidade]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{v.contrato.imovel}</div>
                      <div className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-faint">
                        {v.ref} · {v.contrato.locatario}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-sm font-semibold ${TXT[v.severidade]}`}>{prazo(v.mesesRestantes)}</div>
                      <div className="font-mono text-[0.72rem] text-ink-faint">{formatMesAno(v.data)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-ink-soft">Nenhum vencimento dentro da janela de antecedência.</p>
          )}
        </section>

        <section>
          <div className="flex items-end justify-between border-b border-ink/80 pb-4">
            <h2 className="font-display text-xl font-bold tracking-tight">Reajustes a caminho</h2>
            <Link href="/alertas" className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink">
              Ver alertas →
            </Link>
          </div>
          {reajustes.length > 0 ? (
            <ul>
              {reajustes.slice(0, 6).map((r) => (
                <li key={`${r.ref}-reaj`}>
                  <Link href={`/contratos/${r.ref}`} className="block border-b border-line py-4 transition hover:bg-paper-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate font-semibold">{r.contrato.imovel}</span>
                      <span className="shrink-0 font-mono text-[0.72rem] text-accent-2">{r.contrato.indice}</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-2 font-mono text-sm">
                      <span className="text-ink-faint">{r.ref}</span>
                      <span className={TXT[r.severidade]}>{prazo(r.mesesRestantes)} · {formatMesAno(r.data)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-ink-soft">Nenhum reajuste dentro da janela de antecedência.</p>
          )}
        </section>
      </div>
    </div>
  );
}
