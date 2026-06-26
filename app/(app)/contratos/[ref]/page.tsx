import Link from "next/link";
import { getContratoByRef } from "@/app/_data/contratos-db";
import { ContratoCorpo } from "./ContratoCorpo";

const TOM_CHIP: Record<string, string> = {
  ok: "border-line text-ink-soft",
  atencao: "border-accent/40 text-accent-2",
  perigo: "border-danger/40 text-danger",
};

export default async function ContratoPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const c = await getContratoByRef(decodeURIComponent(ref));

  if (!c) {
    return (
      <div className="mx-auto max-w-[640px] py-10">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.15em] text-ink-faint">§ Contrato</p>
        <h1 className="mt-2 font-display text-2xl font-bold">Contrato não encontrado</h1>
        <p className="mt-3 text-ink-soft">O contrato {ref} não está na carteira.</p>
        <Link href="/carteira" className="mt-6 inline-block font-mono text-[0.72rem] uppercase tracking-[0.12em] text-brand">
          ← Voltar para a carteira
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <Link href="/carteira" className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink">
        ← Carteira
      </Link>

      {/* Cabeçalho */}
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-ink/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint">{c.ref}</span>
            <span className={`border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] ${TOM_CHIP[c.tom]}`}>
              {c.evento === "vence" ? `Vence ${c.data}` : `Reajuste ${c.data}`}
            </span>
          </div>
          <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold tracking-[-0.03em]">
            {c.imovel}
          </h1>
          <p className="mt-1 text-ink-soft">{c.locatario} · {c.tipo}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-[clamp(1.8rem,3vw,2.4rem)] font-bold tracking-tight">{c.aluguel}</div>
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-faint">aluguel atual / mês</div>
        </div>
      </div>

      {/* Régua do tempo */}
      <figure className="mt-10">
        <div className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint">Linha do tempo</div>
        <div className="relative border-t border-ink/80 pt-5">
          <span className="absolute -top-[5px] left-0 size-2.5 -translate-x-px bg-ink" />
          <span className="absolute -top-[7px] size-3.5 -translate-x-1/2 bg-accent" style={{ left: `${c.regua.pct}%` }} />
          <span className="absolute -top-[5px] right-0 size-2.5 translate-x-px bg-ink" />
          <div className="grid grid-cols-3">
            <div>
              <div className="font-mono text-sm font-semibold">{c.regua.inicio}</div>
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">início</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-sm font-semibold text-accent-2">{c.regua.reajuste}</div>
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">reajuste · {c.regua.reajusteLabel}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold">{c.regua.fim}</div>
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">vencimento</div>
            </div>
          </div>
        </div>
      </figure>

      <ContratoCorpo contrato={c} />
    </div>
  );
}
