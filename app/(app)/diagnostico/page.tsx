import Link from "next/link";
import { brl } from "@/app/_data/contratos";
import { getDiagnosticoDb } from "@/app/_data/contratos-db";

const TOM: Record<string, string> = { ok: "bg-ink/40", atencao: "bg-accent", perigo: "bg-danger" };
const TOM_TXT: Record<string, string> = { ok: "text-ink-soft", atencao: "text-accent-2", perigo: "text-danger" };

export default async function DiagnosticoPage() {
  const d = await getDiagnosticoDb();

  return (
    <div className="flex flex-col gap-14">
      {/* Achado principal */}
      <section className="bg-brand-deep px-7 py-10 sm:px-12 sm:py-14">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent">O custo de continuar assim</p>
        <p className="mt-5 font-display text-[clamp(2.6rem,7vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-paper">
          {brl(d.deixadoNaMesa)}
        </p>
        <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-paper/70">
          deixados na mesa nos últimos 12 meses — e{" "}
          <span className="font-semibold text-accent">{brl(d.perdaMensalTotal)}/mês</span>{" "}
          ainda escapando em reajustes previstos e não aplicados.
        </p>
        <Link
          href="#reajustes"
          className="mt-8 inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-paper"
        >
          Ver onde está vazando <span>↓</span>
        </Link>
      </section>

      {/* Resumo */}
      <section className="grid grid-cols-1 border-y border-ink/15 sm:grid-cols-3">
        {[
          { n: d.atrasados.length, l: "reajustes atrasados", tone: "text-accent-2" },
          { n: d.emRisco.length, l: "vencimentos em risco", tone: "text-danger" },
          { n: d.semDocs.length, l: "contratos com documento faltando", tone: "text-ink" },
        ].map((s, i) => (
          <div key={s.l} className={`py-7 ${i > 0 ? "border-t border-line sm:border-l sm:border-t-0 sm:pl-8" : ""}`}>
            <div className={`font-display text-[2.4rem] font-bold leading-none ${s.tone}`}>{s.n}</div>
            <div className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-faint">{s.l}</div>
          </div>
        ))}
      </section>

      {/* §01 Reajustes atrasados */}
      <section id="reajustes" className="scroll-mt-24">
        <div className="flex items-end justify-between border-b border-ink/80 pb-4">
          <h2 className="font-display text-xl font-bold tracking-tight">Reajustes atrasados</h2>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">§ 01</span>
        </div>
        <ul>
          {d.atrasados.map((a) => (
            <li key={a.ref} className="grid grid-cols-1 gap-3 border-b border-line py-5 sm:grid-cols-[1.4fr_1fr_auto] sm:items-center sm:gap-6">
              <div>
                <div className="font-semibold">{a.imovel}</div>
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">
                  {a.ref} · {a.indiceAtraso} · {a.meses} meses atrasado
                </div>
              </div>
              <div className="font-mono text-sm">
                <span className="text-ink-faint">perdendo </span>
                <span className="font-semibold text-danger">{brl(a.perdaMensal)}/mês</span>
                <span className="text-ink-faint"> · acumulado </span>
                <span className="font-semibold">{brl(a.perdaTotal)}</span>
              </div>
              <Link
                href={`/contratos/${a.ref}`}
                className="inline-flex h-9 items-center justify-center rounded-sm bg-brand px-4 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-paper transition hover:bg-brand-2 sm:justify-self-end"
              >
                Aplicar reajuste
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* §02 Vencimentos em risco */}
      <section>
        <div className="flex items-end justify-between border-b border-ink/80 pb-4">
          <h2 className="font-display text-xl font-bold tracking-tight">Vencimentos em risco</h2>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">§ 02</span>
        </div>
        <ul>
          {d.emRisco.map((c) => (
            <li key={c.ref}>
              <Link href={`/contratos/${c.ref}`} className="flex items-center gap-4 border-b border-line py-4 transition hover:bg-paper-2">
                <span className={`size-2 shrink-0 ${TOM[c.tom]}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{c.imovel}</div>
                  <div className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">{c.ref} · {c.locatario}</div>
                </div>
                <div className={`font-mono text-sm font-semibold ${TOM_TXT[c.tom]}`}>
                  {c.evento} {c.data}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* §03 Documentos faltando */}
      <section>
        <div className="flex items-end justify-between border-b border-ink/80 pb-4">
          <h2 className="font-display text-xl font-bold tracking-tight">Documentos faltando</h2>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">§ 03</span>
        </div>
        <ul>
          {d.semDocs.map((c) => (
            <li key={c.ref}>
              <Link href={`/contratos/${c.ref}`} className="flex items-center justify-between gap-4 border-b border-line py-4 transition hover:bg-paper-2">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c.imovel}</div>
                  <div className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">{c.ref}</div>
                </div>
                <span className="shrink-0 font-mono text-sm text-ink-soft">{c.documentos.length} de 3 documentos</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-ink/80 pt-8">
        <Link href="/carteira" className="inline-flex h-[3.25rem] items-center rounded-sm bg-brand px-7 font-semibold text-paper transition hover:bg-brand-2">
          Resolver na carteira
        </Link>
        <span className="text-ink-soft">Cada item acima é dinheiro ou prazo que a planilha não te avisa.</span>
      </div>
    </div>
  );
}
