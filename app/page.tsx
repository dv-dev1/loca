import Link from "next/link";
import type { ReactNode } from "react";

const CONTAINER = "mx-auto w-full max-w-[1200px] px-5 sm:px-6";

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Bell({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-papel/80 backdrop-blur-md backdrop-saturate-150">
      <div className={`${CONTAINER} flex h-[68px] items-center justify-between`}>
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Locá — início">
          <span className="grid size-8 place-items-center rounded-[9px] bg-verde font-display text-[1.05rem] font-extrabold leading-none text-papel shadow-[inset_0_0_0_1px_rgba(255,255,255,.1),0_2px_6px_rgba(15,46,36,.3)]">
            L
          </span>
          <span className="font-display text-[1.05rem] font-bold tracking-tight">
            Locá<span className="text-latao">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Navegação">
          <Link href="#recursos" className="hidden min-h-[42px] items-center rounded-full px-4 text-sm font-medium text-tinta-suave transition hover:bg-tinta/5 hover:text-tinta sm:inline-flex">
            Recursos
          </Link>
          <Link href="#como" className="hidden min-h-[42px] items-center rounded-full px-4 text-sm font-medium text-tinta-suave transition hover:bg-tinta/5 hover:text-tinta sm:inline-flex">
            Como funciona
          </Link>
          <Link href="/login" className="inline-flex min-h-[42px] items-center rounded-full bg-verde px-5 text-sm font-semibold text-papel transition hover:bg-verde-vivo">
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Eyebrow({ children, chip = false }: { children: ReactNode; chip?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.16em] text-verde-vivo ${
        chip ? "rounded-full border border-verde-borda bg-verde-claro px-3 py-1.5" : ""
      }`}
    >
      {chip && <span className="size-1.5 rounded-full bg-latao" />}
      {children}
    </span>
  );
}

function ProductMockup() {
  return (
    <div className="relative animate-rise [animation-delay:120ms]">
      <div className="relative z-10 overflow-hidden rounded-2xl border border-linha bg-superficie shadow-float">
        <div className="flex items-center gap-3 border-b border-linha bg-superficie-2 px-3.5 py-2.5">
          <span className="flex gap-1.5">
            <i className="size-2.5 rounded-full bg-linha-forte" />
            <i className="size-2.5 rounded-full bg-linha-forte" />
            <i className="size-2.5 rounded-full bg-linha-forte" />
          </span>
          <span className="font-mono text-[0.72rem] text-tinta-tenue">carteira · locá</span>
        </div>

        <div className="grid grid-cols-[54px_1fr]">
          <div className="flex flex-col items-center gap-3 border-r border-linha bg-superficie-2 py-4">
            <i className="size-[22px] rounded-md bg-verde" />
            <i className="size-[22px] rounded-md bg-linha-forte" />
            <i className="size-[22px] rounded-md bg-linha-forte" />
            <i className="size-[22px] rounded-md bg-linha-forte" />
          </div>

          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-base font-bold">Carteira</h3>
              <span className="font-mono text-[0.72rem] text-tinta-tenue">junho/2026</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ["128", "contratos ativos", "text-tinta"],
                ["9", "reajustes no mês", "text-latao-escuro"],
                ["4", "vencem em 30d", "text-tinta"],
              ].map(([n, l, c]) => (
                <div key={l} className="rounded-[10px] border border-linha bg-superficie px-3 py-2.5">
                  <div className={`font-display text-[1.4rem] font-bold leading-none ${c}`}>{n}</div>
                  <div className="mt-1 text-[0.66rem] text-tinta-tenue">{l}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3.5 rounded-xl border border-linha bg-superficie p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.78rem] font-semibold">
                  LOC-0429 <span className="font-normal text-tinta-tenue">· Loja Centro</span>
                </span>
                <span className="rounded-full bg-verde-claro px-2.5 py-0.5 text-[0.64rem] font-semibold text-verde-vivo">
                  Vigente
                </span>
              </div>

              <div className="relative mx-1 mt-6 mb-1 h-[3px] rounded-full bg-linha-forte">
                <div className="absolute inset-y-0 left-0 right-[38%] rounded-full bg-verde" />
                <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: "0%" }}>
                  <i className="block size-2.5 rounded-full border-[2.5px] border-verde bg-white" />
                </span>
                <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: "62%" }}>
                  <em className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.62rem] font-semibold not-italic text-latao-escuro">
                    reajuste set/26
                  </em>
                  <i className="block size-3.5 rounded-full border-[3px] border-latao bg-latao shadow-[0_0_0_4px_var(--color-latao-claro)]" />
                </span>
                <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: "100%" }}>
                  <i className="block size-2.5 rounded-full border-[2.5px] border-verde bg-white" />
                </span>
              </div>

              <div className="flex items-end justify-between border-t border-linha pt-3">
                <span>
                  <small className="block text-[0.62rem] text-tinta-tenue">aluguel atual</small>
                  <b className="font-mono text-[0.95rem] font-semibold">R$ 4.200</b>
                </span>
                <span className="px-2 pb-0.5 font-mono text-sm text-tinta-tenue">→</span>
                <span className="text-right">
                  <small className="block text-[0.62rem] text-tinta-tenue">após IGP-M +4,1%</small>
                  <b className="font-mono text-[0.95rem] font-semibold text-verde-vivo">R$ 4.372</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-3 bottom-9 z-20 flex max-w-[230px] animate-float items-center gap-2.5 rounded-[10px] border border-linha border-l-[3px] border-l-latao bg-superficie px-3.5 py-2.5 shadow-lift sm:-right-5">
        <span className="grid size-[26px] shrink-0 place-items-center rounded-[7px] bg-latao-claro text-latao-escuro">
          <Bell className="size-[15px]" />
        </span>
        <span>
          <b className="block text-[0.74rem]">Reajuste em set/26</b>
          <small className="text-[0.66rem] text-tinta-tenue">LOC-0429 · IGP-M +4,1%</small>
        </span>
      </div>
    </div>
  );
}

function Tile({
  className = "",
  icon,
  title,
  desc,
  children,
}: {
  className?: string;
  icon: ReactNode;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <article
      className={`flex min-h-[200px] flex-col gap-3 rounded-2xl border border-linha bg-superficie p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-verde-borda hover:shadow-card ${className}`}
    >
      <span className="grid size-10 place-items-center rounded-[10px] bg-verde-claro text-verde">{icon}</span>
      <h3 className="font-display text-xl font-semibold tracking-tight">{title}</h3>
      <p className="leading-relaxed text-tinta-suave">{desc}</p>
      {children}
    </article>
  );
}

export default function Home() {
  return (
    <main>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(180deg,#000_0%,transparent_72%)]"
          style={{ backgroundImage: "radial-gradient(rgba(20,24,15,.05) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
          aria-hidden
        />
        <div className={`${CONTAINER} relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.08fr]`}>
          <div className="animate-rise">
            <Eyebrow chip>Gestão de locação para imobiliárias</Eyebrow>
            <h1 className="mt-5 font-display text-[clamp(2.9rem,6.2vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-balance">
              Toda a carteira de locação{" "}
              <span className="relative text-verde">
                sob controle
                <span className="absolute inset-x-0 bottom-[0.08em] h-[0.13em] rounded-sm bg-latao/90" />
              </span>
              .
            </h1>
            <p className="mt-6 max-w-[31rem] text-lg leading-relaxed text-tinta-suave">
              Contratos, reajustes, vencimentos e documentos num só lugar — e a
              plataforma avisando antes de cada data, pra nenhum aluguel ficar
              defasado e nenhum prazo passar batido.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex min-h-[54px] items-center gap-2 rounded-full bg-verde px-6 font-semibold text-papel shadow-[0_8px_20px_-6px_rgba(15,46,36,.5)] transition hover:-translate-y-0.5 hover:bg-verde-vivo"
              >
                Entrar no painel <ArrowRight />
              </Link>
              <Link
                href="#recursos"
                className="inline-flex min-h-[54px] items-center rounded-full border border-linha-forte bg-superficie px-6 font-semibold shadow-soft transition hover:-translate-y-0.5 hover:border-tinta"
              >
                Ver como funciona
              </Link>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              {[
                ["IGP-M·IPCA", "reajuste automático"],
                ["30 dias", "aviso antes do vencimento"],
                ["1 lugar", "contratos e documentos"],
              ].map(([n, l]) => (
                <div key={l} className="flex flex-col">
                  <dt className="font-display text-[1.6rem] font-bold leading-none">{n}</dt>
                  <dd className="mt-1 text-xs text-tinta-tenue">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <ProductMockup />
        </div>
      </section>

      {/* ── Faixa de confiança ── */}
      <div className="border-y border-linha bg-superficie-2">
        <div className={`${CONTAINER} flex flex-wrap items-center gap-x-8 gap-y-2 py-5 text-sm text-tinta-suave`}>
          <span className="font-semibold text-tinta">Feito para imobiliárias de médio porte.</span>
          <span>Residencial e comercial.</span>
          <span>
            Índices <b className="font-mono font-semibold text-verde-vivo">IGP-M</b>,{" "}
            <b className="font-mono font-semibold text-verde-vivo">IPCA</b> ou fixo.
          </span>
          <span>Sem planilha.</span>
        </div>
      </div>

      {/* ── Statement ── */}
      <section className="relative overflow-hidden bg-verde-fundo">
        <div
          className="pointer-events-none absolute -left-[8%] -top-[30%] size-[32rem] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(192,138,46,.18), transparent 62%)" }}
          aria-hidden
        />
        <div className={`${CONTAINER} relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]`}>
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-latao">O custo do esquecimento</span>
            <h2 className="mt-4 font-display text-[clamp(2.1rem,4vw,3rem)] font-bold leading-[1.08] tracking-[-0.025em] text-papel text-balance">
              Cada reajuste que passa batido é{" "}
              <span className="text-[#e9c884]">aluguel defasado o ano inteiro</span>.
            </h2>
            <p className="mt-5 max-w-[30rem] text-lg leading-relaxed text-papel/70">
              Numa carteira grande, basta um punhado de contratos parados no índice
              antigo pra virar receita perdida — sua e do proprietário. A plataforma
              acompanha cada data e te cobra antes, não depois.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <b className="font-display text-[clamp(2rem,4vw,2.8rem)] font-extrabold leading-none text-papel">
                0<span className="text-[#e9c884]"> esquecidos</span>
              </b>
              <small className="mt-1.5 block text-sm text-papel/60">
                Reajustes e vencimentos rastreados contrato a contrato.
              </small>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <b className="font-display text-[clamp(2rem,4vw,2.8rem)] font-extrabold leading-none text-papel">
                100%<span className="text-[#e9c884]"> da carteira</span>
              </b>
              <small className="mt-1.5 block text-sm text-papel/60">
                Num só lugar: valores, datas, garantias e documentos.
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recursos (bento) ── */}
      <section id="recursos" className={`${CONTAINER} scroll-mt-20 py-16 sm:py-24`}>
        <div className="max-w-2xl">
          <Eyebrow>O que ela faz</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(2.1rem,4vw,3rem)] font-bold leading-[1.08] tracking-[-0.025em] text-balance">
            Do cadastro ao vencimento, sem você ter que lembrar.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-tinta-suave">
            Quatro coisas que a planilha não faz — e que a imobiliária precisa todo mês.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Tile
            className="lg:col-span-4"
            icon={<svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19 19 5" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>}
            title="Reajuste no automático"
            desc="Escolha IGP-M, IPCA ou índice fixo. Na data certa, a plataforma calcula o novo valor e guarda o histórico. Você confere — não recalcula."
          >
            <span className="mt-auto inline-flex items-center gap-2 self-start rounded-full border border-linha-forte bg-papel px-3.5 py-1.5 font-mono text-sm font-semibold">
              <s className="text-tinta-tenue no-underline">R$ 4.200</s>
              <em className="not-italic text-latao-escuro">IGP-M +4,1%</em> →{" "}
              <b className="text-verde-vivo">R$ 4.372</b>
            </span>
          </Tile>

          <Tile className="lg:col-span-2" icon={<Bell className="size-6" />} title="Avisa antes" desc="Alertas de vencimento e renovação por contrato. Ninguém é pego de surpresa." />

          <Tile
            className="lg:col-span-3"
            icon={<svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M8 13h8M8 17h6" /></svg>}
            title="Documentos no lugar"
            desc="Contrato, matrícula, IPTU e aditivos anexados a cada imóvel — fáceis de achar quando o cliente liga."
          />

          <Tile
            className="lg:col-span-3"
            icon={<svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 4-5" /></svg>}
            title="Carteira sob controle"
            desc="Um painel com tudo que vence, reajusta e renova — pra decidir o mês olhando uma tela só."
          />
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como" className={`${CONTAINER} scroll-mt-20 pb-16 sm:pb-24`}>
        <div className="max-w-2xl">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(2.1rem,4vw,3rem)] font-bold leading-[1.08] tracking-[-0.025em] text-balance">
            Três passos. Depois é só ser avisado.
          </h2>
        </div>
        <ol className="mt-10 grid gap-x-5 gap-y-8 sm:grid-cols-3">
          {[
            ["Cadastre o contrato", "Imóvel, locador, locatário, valor, garantia e índice de reajuste. Anexe os documentos."],
            ["A plataforma acompanha", "Ela cuida das datas: próximo reajuste, próximo vencimento, renovação."],
            ["Você é avisado antes", "Alerta com o valor já calculado. Você confere e segue — sem planilha, sem susto."],
          ].map(([t, d], i) => (
            <li key={t} className="border-t-2 border-linha-forte pt-6">
              <span className="font-mono text-xs font-semibold text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{t}</h3>
              <p className="mt-2 leading-relaxed text-tinta-suave">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Encerramento ── */}
      <section className={CONTAINER}>
        <div className="relative mb-20 flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-verde px-6 py-16 text-center sm:px-12 sm:py-20">
          <div
            className="pointer-events-none absolute -bottom-1/2 left-1/2 size-[38rem] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(192,138,46,.22), transparent 64%)" }}
            aria-hidden
          />
          <h2 className="relative max-w-[32rem] font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold leading-[1.12] tracking-[-0.02em] text-papel">
            Tire sua carteira de locação da planilha.
          </h2>
          <p className="relative text-papel/70">Veja a plataforma com seus próprios contratos.</p>
          <Link
            href="/login"
            className="relative inline-flex min-h-[54px] items-center gap-2 rounded-full bg-latao px-6 font-semibold text-[#1a1305] shadow-[0_10px_26px_-8px_rgba(0,0,0,.5)] transition hover:-translate-y-0.5 hover:bg-[#d29a3d]"
          >
            Entrar no painel <ArrowRight />
          </Link>
        </div>
      </section>

      {/* ── Rodapé ── */}
      <footer className="border-t border-linha">
        <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-4 py-8 pb-12 text-sm text-tinta-tenue`}>
          <span>Gestão de locação para imobiliárias.</span>
          <span>© {new Date().getFullYear()} Locá</span>
        </div>
      </footer>
    </main>
  );
}
