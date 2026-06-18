import Link from "next/link";
import type { ReactNode } from "react";

const WRAP = "mx-auto w-full max-w-[1240px] px-5 sm:px-8";

function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint ${className}`}>
      {children}
    </span>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-sm">
      <div className={`${WRAP} flex h-16 items-center justify-between border-b border-ink/15`}>
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight" aria-label="Locá — início">
          Locá<span className="text-accent">.</span>
        </Link>
        <nav className="flex items-center gap-7" aria-label="Navegação">
          <Link href="#recursos" className="hidden font-mono text-[0.72rem] uppercase tracking-[0.15em] text-ink-soft transition hover:text-ink sm:inline">
            Recursos
          </Link>
          <Link href="#como" className="hidden font-mono text-[0.72rem] uppercase tracking-[0.15em] text-ink-soft transition hover:text-ink sm:inline">
            Como funciona
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center rounded-sm bg-brand px-4 font-mono text-[0.72rem] uppercase tracking-[0.15em] text-paper transition hover:bg-brand-2"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* Assinatura: régua do tempo no estilo "registro" — hairline + marcadores quadrados */
function ReguaTempo() {
  return (
    <figure className="mt-14 sm:mt-20">
      <div className="mb-3">
        <Kicker>Linha do tempo · contrato LOC-0429</Kicker>
      </div>
      <div className="relative border-t border-ink/80 pt-5">
        {/* início */}
        <span className="absolute -top-[5px] left-0 size-2.5 -translate-x-px bg-ink" />
        {/* reajuste (clay) */}
        <span className="absolute -top-[7px] left-[58%] size-3.5 -translate-x-1/2 bg-accent" />
        {/* vencimento */}
        <span className="absolute -top-[5px] right-0 size-2.5 translate-x-px bg-ink" />

        <div className="grid grid-cols-3">
          <div>
            <div className="font-mono text-sm font-semibold">jan/25</div>
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">início</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-sm font-semibold text-accent-2">set/26</div>
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">reajuste · IGP-M +4,1%</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm font-semibold">jan/27</div>
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">vencimento</div>
          </div>
        </div>
      </div>
      <figcaption className="mt-4 flex items-baseline gap-2 font-mono text-sm">
        <span className="text-ink-faint">aluguel</span>
        <span className="font-semibold">R$ 4.200</span>
        <span className="text-ink-faint">→ após reajuste</span>
        <span className="font-semibold text-accent-2">R$ 4.372</span>
      </figcaption>
    </figure>
  );
}

function FeatureRow({ n, title, desc, note }: { n: string; title: string; desc: string; note?: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-line py-8 sm:grid-cols-[5rem_1fr] sm:gap-8 sm:py-10">
      <div className="font-mono text-sm text-accent-2">{n}</div>
      <div className="grid gap-2 sm:grid-cols-[1.1fr_1fr] sm:gap-10">
        <h3 className="font-display text-2xl font-bold tracking-tight sm:text-[1.9rem]">{title}</h3>
        <div>
          <p className="text-lg leading-relaxed text-ink-soft">{desc}</p>
          {note}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <Navbar />

      {/* ── Hero ── */}
      <section className={`${WRAP} pt-12 sm:pt-20`}>
        <div className="flex items-center justify-between">
          <Kicker>§ Gestão de locação</Kicker>
          <Kicker className="hidden sm:inline">Gestão de Imobiliárias</Kicker>
        </div>
        <div className="mt-5 border-t border-ink/15 pt-8 sm:pt-12">
          <h1 className="max-w-[16ch] font-display text-[clamp(3rem,9vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] animate-rise">
            Toda a carteira de locação{" "}
            <span className="relative whitespace-nowrap text-brand">
              sob controle
              <span className="absolute inset-x-0 -bottom-1 h-[5px] bg-accent" />
            </span>
            .
          </h1>

          <div className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-[1.05fr_0.95fr] sm:gap-16">
            <p className="max-w-[38ch] text-xl leading-relaxed text-ink-soft">
              Contratos, reajustes, vencimentos e documentos num só lugar — e a
              plataforma avisando antes de cada data, pra nenhum aluguel ficar
              defasado e nenhum prazo passar batido.
            </p>
            <div className="flex flex-col items-start gap-5 sm:items-end sm:justify-end">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/login"
                  className="inline-flex h-[3.25rem] items-center rounded-sm bg-brand px-7 font-semibold text-paper transition hover:bg-brand-2"
                >
                  Entrar no painel
                </Link>
                <Link
                  href="#recursos"
                  className="group inline-flex items-center gap-2 font-semibold text-ink"
                >
                  Ver como funciona
                  <span className="transition group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>

          <ReguaTempo />
        </div>
      </section>

      {/* ── Números ── */}
      <section className={`${WRAP} mt-20 sm:mt-28`}>
        <div className="grid grid-cols-1 border-y border-ink/15 sm:grid-cols-3">
          {[
            ["IGP-M · IPCA", "reajuste calculado e aplicado na data"],
            ["30 dias", "de aviso antes de cada vencimento"],
            ["1 só lugar", "contratos, valores, garantias e documentos"],
          ].map(([n, l], i) => (
            <div
              key={l}
              className={`py-8 sm:py-10 ${i > 0 ? "border-t border-line sm:border-l sm:border-t-0 sm:pl-10" : ""}`}
            >
              <div className="font-display text-[1.7rem] font-bold tracking-tight sm:text-[2rem]">{n}</div>
              <div className="mt-1 max-w-[28ch] text-ink-soft">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Statement ── */}
      <section className="mt-24 bg-brand-deep sm:mt-32">
        <div className={`${WRAP} py-20 sm:py-28`}>
          <Kicker className="text-accent">O custo do esquecimento</Kicker>
          <p className="mt-8 max-w-[20ch] font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.03em] text-paper">
            Cada reajuste esquecido é{" "}
            <span className="text-accent">aluguel defasado o ano inteiro</span>.
          </p>
          <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-paper/65">
            Numa carteira grande, basta um punhado de contratos parados no índice
            antigo pra virar receita perdida — sua e do proprietário. A plataforma
            acompanha cada data e te cobra antes, não depois.
          </p>
        </div>
      </section>

      {/* ── §01 Recursos ── */}
      <section id="recursos" className={`${WRAP} scroll-mt-20 pt-20 sm:pt-28`}>
        <div className="flex items-end justify-between border-b border-ink/80 pb-5">
          <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-tight">
            O que ela faz
          </h2>
          <Kicker className="hidden sm:inline">§ 01</Kicker>
        </div>

        <FeatureRow
          n="01"
          title="Reajuste no automático"
          desc="Escolha IGP-M, IPCA ou índice fixo. Na data certa, a plataforma calcula o novo valor e guarda o histórico. Você confere — não recalcula."
          note={
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-sm">
              <s className="text-ink-faint no-underline">R$ 4.200</s>
              <span className="text-accent-2">IGP-M +4,1%</span>
              <span className="text-ink-faint">→</span>
              <span className="font-semibold">R$ 4.372</span>
            </p>
          }
        />
        <FeatureRow
          n="02"
          title="Avisa antes do vencimento"
          desc="Alertas de vencimento e renovação por contrato. Ninguém é pego de surpresa no fim do mês."
        />
        <FeatureRow
          n="03"
          title="Documentos no lugar"
          desc="Contrato, matrícula, IPTU e aditivos anexados a cada imóvel — fáceis de achar quando o cliente liga."
        />
        <FeatureRow
          n="04"
          title="A carteira inteira numa tela"
          desc="Um painel com tudo que vence, reajusta e renova, pra decidir o mês olhando um lugar só."
        />
      </section>

      {/* ── §02 Como funciona ── */}
      <section id="como" className={`${WRAP} scroll-mt-20 pt-20 sm:pt-28`}>
        <div className="flex items-end justify-between border-b border-ink/80 pb-5">
          <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-tight">
            Como funciona
          </h2>
          <Kicker className="hidden sm:inline">§ 02</Kicker>
        </div>
        <div className="grid gap-x-10 gap-y-10 pt-10 sm:grid-cols-3">
          {[
            ["Cadastre o contrato", "Imóvel, locador, locatário, valor, garantia e índice de reajuste. Anexe os documentos."],
            ["A plataforma acompanha", "Ela cuida das datas: próximo reajuste, próximo vencimento, renovação."],
            ["Você é avisado antes", "Alerta com o valor já calculado. Você confere e segue — sem planilha, sem susto."],
          ].map(([t, d], i) => (
            <div key={t}>
              <div className="font-mono text-sm text-accent-2">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-3 font-display text-xl font-bold tracking-tight">{t}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Encerramento ── */}
      <section className={`${WRAP} pt-24 pb-24 sm:pt-32`}>
        <div className="border-t border-ink/80 pt-12">
          <h2 className="max-w-[14ch] font-display text-[clamp(2.4rem,6vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
            Tire sua carteira de locação da{" "}
            <span className="text-brand">planilha</span>.
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href="/login"
              className="inline-flex h-[3.25rem] items-center rounded-sm bg-brand px-7 font-semibold text-paper transition hover:bg-brand-2"
            >
              Entrar no painel
            </Link>
            <span className="text-ink-soft">Veja a plataforma com seus próprios contratos.</span>
          </div>
        </div>
      </section>

      {/* ── Rodapé ── */}
      <footer className="border-t border-ink/15">
        <div className={`${WRAP} flex flex-wrap items-center justify-between gap-4 py-8`}>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Locá<span className="text-accent">.</span>
          </span>
          <Kicker>Gestão de locação · © {new Date().getFullYear()}</Kicker>
        </div>
      </footer>
    </main>
  );
}
