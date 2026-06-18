import Link from "next/link";

const STATS = [
  { n: "128", l: "contratos ativos" },
  { n: "4", l: "vencem em 30 dias", tone: "accent" },
  { n: "9", l: "reajustes neste mês" },
  { n: "R$ 612 mil", l: "aluguel sob gestão / mês" },
];

const VENCIMENTOS = [
  { ref: "LOC-0388", imovel: "Casa · R. das Acácias, 120", quem: "Família Ribeiro", dias: -3, data: "15 jun 2026", tom: "perigo" },
  { ref: "LOC-0429", imovel: "Apto 302 · Ed. Aurora", quem: "Marina Lopes", dias: 8, data: "30 jun 2026", tom: "atencao" },
  { ref: "LOC-0411", imovel: "Sala 14 · Empresarial Norte", quem: "Contábil Vega ME", dias: 21, data: "13 jul 2026", tom: "ok" },
  { ref: "LOC-0356", imovel: "Loja 3 · Galeria Sul", quem: "Ótica Mirante", dias: 27, data: "19 jul 2026", tom: "ok" },
];

const REAJUSTES = [
  { ref: "LOC-0429", imovel: "Apto 302 · Ed. Aurora", indice: "IGP-M +4,1%", de: "R$ 2.400", para: "R$ 2.498" },
  { ref: "LOC-0402", imovel: "Sala 14 · Empresarial Norte", indice: "IPCA +3,6%", de: "R$ 5.200", para: "R$ 5.387" },
  { ref: "LOC-0377", imovel: "Loja 3 · Galeria Sul", indice: "IGP-M +4,1%", de: "R$ 8.900", para: "R$ 9.265" },
];

const TOM: Record<string, string> = {
  ok: "bg-ink/40",
  atencao: "bg-accent",
  perigo: "bg-danger",
};
const TOM_TXT: Record<string, string> = {
  ok: "text-ink",
  atencao: "text-accent-2",
  perigo: "text-danger",
};

function prazo(dias: number): string {
  if (dias < 0) return `vencido há ${Math.abs(dias)}d`;
  if (dias === 0) return "vence hoje";
  return `em ${dias}d`;
}

export default function PainelPage() {
  return (
    <div className="flex flex-col gap-14">
      {/* Números */}
      <section className="grid grid-cols-2 border-y border-ink/15 lg:grid-cols-4">
        {STATS.map((s, i) => (
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
        {/* Vencimentos */}
        <section>
          <div className="flex items-end justify-between border-b border-ink/80 pb-4">
            <h2 className="font-display text-xl font-bold tracking-tight">Próximos vencimentos</h2>
            <Link href="/carteira" className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink">
              Ver carteira →
            </Link>
          </div>
          <ul>
            {VENCIMENTOS.map((v) => (
              <li key={v.ref} className="flex items-center gap-4 border-b border-line py-4">
                <span className={`size-2 shrink-0 ${TOM[v.tom]}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{v.imovel}</div>
                  <div className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-faint">
                    {v.ref} · {v.quem}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-sm font-semibold ${TOM_TXT[v.tom]}`}>{prazo(v.dias)}</div>
                  <div className="font-mono text-[0.72rem] text-ink-faint">{v.data}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Reajustes */}
        <section>
          <div className="flex items-end justify-between border-b border-ink/80 pb-4">
            <h2 className="font-display text-xl font-bold tracking-tight">Reajustes deste mês</h2>
          </div>
          <ul>
            {REAJUSTES.map((r) => (
              <li key={r.ref} className="border-b border-line py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-semibold">{r.imovel}</span>
                  <span className="shrink-0 font-mono text-[0.72rem] text-accent-2">{r.indice}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2 font-mono text-sm">
                  <span className="text-ink-faint">{r.ref}</span>
                  <span className="ml-auto">
                    <s className="text-ink-faint no-underline">{r.de}</s>{" "}
                    <span className="text-ink-faint">→</span>{" "}
                    <b className="font-semibold">{r.para}</b>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
