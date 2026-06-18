import Link from "next/link";

type Tipo = "Residencial" | "Comercial";
type Tom = "ok" | "atencao" | "perigo";

const CONTRATOS: {
  ref: string;
  imovel: string;
  locatario: string;
  tipo: Tipo;
  aluguel: string;
  evento: string;
  data: string;
  tom: Tom;
}[] = [
  { ref: "LOC-0388", imovel: "Casa · R. das Acácias, 120", locatario: "Família Ribeiro", tipo: "Residencial", aluguel: "R$ 3.100", evento: "vence", data: "15 jun 2026", tom: "perigo" },
  { ref: "LOC-0429", imovel: "Apto 302 · Ed. Aurora", locatario: "Marina Lopes", tipo: "Residencial", aluguel: "R$ 2.498", evento: "vence", data: "30 jun 2026", tom: "atencao" },
  { ref: "LOC-0411", imovel: "Sala 14 · Empresarial Norte", locatario: "Contábil Vega ME", tipo: "Comercial", aluguel: "R$ 5.387", evento: "reajuste", data: "13 jul 2026", tom: "ok" },
  { ref: "LOC-0356", imovel: "Loja 3 · Galeria Sul", locatario: "Ótica Mirante", tipo: "Comercial", aluguel: "R$ 9.265", evento: "vence", data: "19 jul 2026", tom: "ok" },
  { ref: "LOC-0341", imovel: "Apto 71 · Ed. Cedro", locatario: "Bruno e Carla Tavares", tipo: "Residencial", aluguel: "R$ 2.050", evento: "reajuste", data: "02 ago 2026", tom: "ok" },
  { ref: "LOC-0312", imovel: "Casa · Al. dos Ipês, 45", locatario: "Renata Fagundes", tipo: "Residencial", aluguel: "R$ 4.400", evento: "vence", data: "28 ago 2026", tom: "ok" },
  { ref: "LOC-0298", imovel: "Conj. 9 · Torre Marília", locatario: "Estúdio Norte Arq.", tipo: "Comercial", aluguel: "R$ 6.700", evento: "reajuste", data: "10 set 2026", tom: "ok" },
];

const TOM: Record<Tom, string> = { ok: "bg-ink/40", atencao: "bg-accent", perigo: "bg-danger" };
const TOM_TXT: Record<Tom, string> = { ok: "text-ink-soft", atencao: "text-accent-2", perigo: "text-danger" };

export default function CarteiraPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/80 pb-4">
        <div className="flex items-center gap-5 font-mono text-[0.72rem] uppercase tracking-[0.12em]">
          <span className="text-ink">Todos</span>
          <span className="text-ink-faint transition hover:text-ink">Residencial</span>
          <span className="text-ink-faint transition hover:text-ink">Comercial</span>
        </div>
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint">
          {CONTRATOS.length} contratos vigentes
        </span>
      </div>

      {/* cabeçalho da tabela */}
      <div className="hidden grid-cols-[1.6fr_1.2fr_0.8fr_0.8fr_1fr] gap-4 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink-faint lg:grid">
        <span>Imóvel</span>
        <span>Locatário</span>
        <span>Tipo</span>
        <span className="text-right">Aluguel</span>
        <span className="text-right">Próximo evento</span>
      </div>

      <ul className="-mt-2">
        {CONTRATOS.map((c) => (
          <li key={c.ref}>
            <Link
              href="/carteira"
              className="grid grid-cols-1 items-center gap-y-2 border-b border-line py-4 transition hover:bg-paper-2 lg:grid-cols-[1.6fr_1.2fr_0.8fr_0.8fr_1fr] lg:gap-4 lg:px-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`size-2 shrink-0 ${TOM[c.tom]}`} />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c.imovel}</div>
                  <div className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">{c.ref}</div>
                </div>
              </div>
              <div className="truncate text-ink-soft lg:pl-0 pl-5">{c.locatario}</div>
              <div className="pl-5 lg:pl-0">
                <span className="inline-block border border-line px-2 py-0.5 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-ink-soft">
                  {c.tipo}
                </span>
              </div>
              <div className="pl-5 font-mono font-semibold lg:pl-0 lg:text-right">{c.aluguel}</div>
              <div className="pl-5 lg:pl-0 lg:text-right">
                <span className={`font-mono text-sm font-medium ${TOM_TXT[c.tom]}`}>{c.evento} </span>
                <span className="font-mono text-sm text-ink-faint">{c.data}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
