import Link from "next/link";
import { CONTRATOS, type Tom } from "@/app/_data/contratos";
import { ExportCsv } from "@/app/_components/export-csv";

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
        <div className="flex items-center gap-5">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint">
            {CONTRATOS.length} contratos vigentes
          </span>
          <Link
            href="/contratos/importar"
            className="inline-flex h-9 items-center rounded-sm border border-ink/25 px-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-soft transition hover:border-ink hover:text-ink"
          >
            Importar planilha
          </Link>
          <ExportCsv />
        </div>
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
              href={`/contratos/${c.ref}`}
              className="grid grid-cols-1 items-center gap-y-2 border-b border-line py-4 transition hover:bg-paper-2 lg:grid-cols-[1.6fr_1.2fr_0.8fr_0.8fr_1fr] lg:gap-4 lg:px-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`size-2 shrink-0 ${TOM[c.tom]}`} />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c.imovel}</div>
                  <div className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">{c.ref}</div>
                </div>
              </div>
              <div className="truncate pl-5 text-ink-soft lg:pl-0">{c.locatario}</div>
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
