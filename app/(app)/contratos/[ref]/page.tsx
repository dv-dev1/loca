import Link from "next/link";
import { getContrato } from "@/app/_data/contratos";

const TOM_CHIP: Record<string, string> = {
  ok: "border-line text-ink-soft",
  atencao: "border-accent/40 text-accent-2",
  perigo: "border-danger/40 text-danger",
};

function Def({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-3">
      <dt className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className={`text-right ${mono ? "font-mono" : ""} ${mono ? "font-medium" : "font-semibold"}`}>{value}</dd>
    </div>
  );
}

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-2 flex items-baseline gap-3">
      <span className="font-mono text-sm text-accent-2">{n}</span>
      <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
    </div>
  );
}

export default async function ContratoPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const c = getContrato(decodeURIComponent(ref));

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

      {/* Conteúdo */}
      <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-10">
          <section>
            <SectionTitle n="01" title="Imóvel" />
            <dl>
              <Def label="Endereço" value={c.endereco} />
              <Def label="Tipo" value={c.tipo} />
              <Def label="Matrícula" value={c.matricula} mono />
              <Def label="Inscrição IPTU" value={c.iptu} mono />
            </dl>
          </section>
          <section>
            <SectionTitle n="02" title="Partes" />
            <dl>
              <Def label="Locador" value={c.locador} />
              <Def label="CPF / CNPJ" value={c.locadorDoc} mono />
              <Def label="Locatário" value={c.locatario} />
              <Def label="CPF / CNPJ" value={c.locatarioDoc} mono />
            </dl>
          </section>
          <section>
            <SectionTitle n="03" title="Locação" />
            <dl>
              <Def label="Aluguel" value={c.aluguel} mono />
              <Def label="Índice de reajuste" value={c.indice} />
              <Def label="Periodicidade" value={c.periodicidade} />
              <Def label="Vigência" value={`${c.inicio} — ${c.fim}`} mono />
              <Def label="Dia de vencimento" value={c.vencimentoDia} mono />
              <Def label="Garantia" value={c.garantia} />
            </dl>
          </section>
        </div>

        <div className="flex flex-col gap-10">
          <section>
            <SectionTitle n="04" title="Documentos" />
            <ul>
              {c.documentos.map((d) => (
                <li key={d} className="flex items-center justify-between gap-4 border-b border-line py-3">
                  <span className="flex items-center gap-3 min-w-0">
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></svg>
                    <span className="truncate text-sm">{d}</span>
                  </span>
                  <a href="#" className="shrink-0 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-brand transition hover:text-brand-2">Baixar</a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle n="05" title="Histórico de reajustes" />
            <ul>
              {c.reajustes.map((r) => (
                <li key={r.data} className="border-b border-line py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-sm">{r.data}</span>
                    <span className="font-mono text-[0.72rem] text-accent-2">{r.indice}</span>
                  </div>
                  <div className="mt-1 text-right font-mono text-sm">
                    <s className="text-ink-faint no-underline">{r.de}</s>{" "}
                    <span className="text-ink-faint">→</span>{" "}
                    <b className="font-semibold">{r.para}</b>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-3">
            <button className="inline-flex h-12 items-center justify-center rounded-sm bg-brand font-semibold text-paper transition hover:bg-brand-2">
              Editar contrato
            </button>
            <button className="inline-flex h-12 items-center justify-center rounded-sm border border-ink/25 font-semibold transition hover:border-ink">
              Baixar contrato (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
