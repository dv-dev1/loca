import Link from "next/link";
import { getContratos } from "@/app/_data/contratos-db";
import { type Alerta, type Severidade, alertasDaCarteira } from "@/lib/domain/alertas";
import { formatMesAno } from "@/lib/domain/datas";

const DOT: Record<Severidade, string> = {
  perigo: "bg-danger",
  atencao: "bg-accent",
  info: "bg-ink/40",
};
const TXT: Record<Severidade, string> = {
  perigo: "text-danger",
  atencao: "text-accent-2",
  info: "text-ink-soft",
};

function prazoLabel(meses: number): string {
  if (meses <= 0) return "neste mês";
  if (meses === 1) return "em 1 mês";
  return `em ${meses} meses`;
}

function Linha({ a }: { a: Alerta }) {
  return (
    <li>
      <Link
        href={`/contratos/${a.ref}`}
        className="grid grid-cols-1 gap-2 border-b border-line py-5 transition hover:bg-paper-2 focus-visible:bg-paper-2 sm:grid-cols-[1.5fr_1fr_auto] sm:items-center sm:gap-6"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <span className={`size-2 shrink-0 ${DOT[a.severidade]}`} aria-hidden />
          <div className="min-w-0">
            <div className="truncate font-semibold">{a.contrato.imovel}</div>
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">
              {a.ref} · {a.contrato.tipo} · {a.contrato.locatario}
            </div>
          </div>
        </div>
        <div className="pl-5 font-mono text-sm sm:pl-0">
          <span className={`font-semibold ${TXT[a.severidade]}`}>{prazoLabel(a.mesesRestantes)}</span>
          <span className="text-ink-faint"> · {formatMesAno(a.data)}</span>
        </div>
        <span className="pl-5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-faint sm:justify-self-end sm:pl-0">
          Ver contrato →
        </span>
      </Link>
    </li>
  );
}

function Secao({ id, n, titulo, descricao, alertas }: { id: string; n: string; titulo: string; descricao: string; alertas: Alerta[] }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-end justify-between gap-4 border-b border-ink/80 pb-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold tracking-tight">{titulo}</h2>
          <p className="mt-1 text-sm text-ink-soft">{descricao}</p>
        </div>
        <span className="shrink-0 whitespace-nowrap pl-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">
          § {n}
        </span>
      </div>
      {alertas.length > 0 ? (
        <ul>
          {alertas.map((a) => (
            <Linha key={`${a.ref}-${a.tipo}`} a={a} />
          ))}
        </ul>
      ) : (
        <p className="py-6 text-ink-soft">Nada pedindo ação por aqui.</p>
      )}
    </section>
  );
}

export default async function AlertasPage() {
  const hoje = new Date();
  const alertas = alertasDaCarteira(await getContratos(), hoje);
  const reajustes = alertas.filter((a) => a.tipo === "reajuste");
  const vencimentos = alertas.filter((a) => a.tipo === "vencimento");

  if (alertas.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">§ Alertas</p>
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1] tracking-[-0.02em]">
          Carteira em dia.
        </h1>
        <p className="max-w-[48ch] text-lg leading-relaxed text-ink-soft">
          Nenhum reajuste ou vencimento dentro da janela de antecedência. Volte quando o calendário apertar — a gente avisa antes.
        </p>
        <Link
          href="/carteira"
          className="inline-flex h-[3.25rem] w-fit items-center rounded-sm bg-brand px-7 font-semibold text-paper transition hover:bg-brand-2"
        >
          Ver a carteira
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-14">
      <section>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent">Antes do prazo, não depois</p>
        <p className="mt-5 font-display text-[clamp(2.4rem,6vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">
          {alertas.length} {alertas.length === 1 ? "contrato pede" : "contratos pedem"} ação
        </p>
        <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
          Reajustes anuais e vencimentos chegando dentro da janela de antecedência — residencial avisa 2 e 1 mês antes; comercial,
          até 8 meses antes para a renovação.
        </p>
      </section>

      <section className="grid grid-cols-1 border-y border-ink/15 sm:grid-cols-2">
        {[
          { n: reajustes.length, l: "reajustes a aplicar", href: "#reajustes" },
          { n: vencimentos.length, l: "vencimentos e renovações", href: "#vencimentos" },
        ].map((s, i) => (
          <Link
            key={s.l}
            href={s.href}
            className={`py-7 transition hover:bg-paper-2 ${i > 0 ? "border-t border-line sm:border-l sm:border-t-0 sm:pl-8" : ""}`}
          >
            <div className="font-display text-[2.4rem] font-bold leading-none">{s.n}</div>
            <div className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-faint">{s.l}</div>
          </Link>
        ))}
      </section>

      <Secao
        id="reajustes"
        n="01"
        titulo="Reajustes a caminho"
        descricao="Aniversário anual do índice — aja antes de perder o mês."
        alertas={reajustes}
      />
      <Secao
        id="vencimentos"
        n="02"
        titulo="Vencimentos e renovações"
        descricao="Fim do contrato se aproximando. No comercial, janela da ação renovatória."
        alertas={vencimentos}
      />
    </div>
  );
}
