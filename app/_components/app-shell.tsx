"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV_OPERACAO = [
  { href: "/painel", label: "Painel" },
  { href: "/contratos/novo", label: "Novo contrato", destaque: true },
  { href: "/carteira", label: "Carteira" },
  { href: "/alertas", label: "Alertas" },
  { href: "/contratos/importar", label: "Importar" },
  { href: "/locadores", label: "Locadores" },
];

const NAV_GESTAO = [
  { href: "/diagnostico", label: "Diagnóstico" },
  { href: "/configuracoes", label: "Configurações" },
];

function SinoAlertas({ count }: { count: number }) {
  return (
    <Link
      href="/alertas"
      aria-label={count > 0 ? `Alertas — ${count} pedindo ação` : "Alertas"}
      className="relative inline-flex size-11 items-center justify-center rounded-sm text-ink transition hover:bg-paper-2 focus-visible:bg-paper-2"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span className="absolute right-1.5 top-1.5 flex min-w-[1.1rem] items-center justify-center rounded-full bg-danger px-1 font-mono text-[0.62rem] font-bold leading-[1.1rem] text-paper">
          {count}
        </span>
      )}
    </Link>
  );
}

function topbar(pathname: string): { kicker: string; title: string } {
  if (pathname.startsWith("/carteira")) return { kicker: "§ Carteira", title: "Contratos vigentes" };
  if (pathname.startsWith("/contratos/novo")) return { kicker: "§ Contratos", title: "Novo contrato" };
  if (pathname.startsWith("/contratos/importar")) return { kicker: "§ Migração", title: "Importar da planilha" };
  if (pathname.startsWith("/contratos/")) return { kicker: "§ Contrato", title: "Detalhe do contrato" };
  if (pathname.startsWith("/alertas")) return { kicker: "§ Alertas", title: "Reajustes e vencimentos" };
  if (pathname.startsWith("/locadores")) return { kicker: "§ Locadores", title: "Acessos do cliente" };
  if (pathname.startsWith("/configuracoes")) return { kicker: "§ Configurações", title: "Dados da imobiliária" };
  if (pathname.startsWith("/diagnostico")) return { kicker: "§ Diagnóstico", title: "Raio-X da carteira" };
  if (pathname.startsWith("/painel")) return { kicker: "§ Painel", title: "Visão da carteira" };
  return { kicker: "§ Locá", title: "Gestão de locação" };
}

export function AppShell({ children, alertasCount = 0 }: { children: ReactNode; alertasCount?: number }) {
  const pathname = usePathname();
  const bar = topbar(pathname);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-paper-2 px-5 py-6 md:flex">
        <Link href="/" className="px-2 font-display text-xl font-extrabold tracking-tight">
          Locá<span className="text-accent">.</span>
        </Link>

        <nav className="mt-10 flex flex-1 flex-col gap-6" aria-label="Navegação">
          <div className="flex flex-col gap-1">
            <p className="px-3 pb-1 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
              § Operação
            </p>
            {NAV_OPERACAO.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center justify-between rounded-sm px-3 py-2 transition ${
                    active ? "bg-paper" : "hover:bg-paper/60"
                  }`}
                >
                  {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 bg-accent" />}
                  <span
                    className={`text-sm font-semibold ${
                      active ? "text-brand" : item.destaque ? "text-accent" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.href === "/alertas" && alertasCount > 0 && (
                    <span className="flex min-w-[1.1rem] items-center justify-center rounded-full bg-danger px-1 font-mono text-[0.62rem] font-bold leading-[1.1rem] text-paper">
                      {alertasCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-1">
            <p className="px-3 pb-1 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
              § Gestão
            </p>
            {NAV_GESTAO.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-sm px-3 py-2 transition ${
                    active ? "bg-paper" : "hover:bg-paper/60"
                  }`}
                >
                  {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 bg-accent" />}
                  <span className={`text-sm font-semibold ${active ? "text-brand" : "text-ink"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-line pt-4">
          <p className="px-1 text-sm font-semibold">Imobiliária Demo</p>
          <Link href="/" className="px-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink">
            Sair
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-line bg-paper/85 px-5 py-4 backdrop-blur-sm sm:px-8">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint">{bar.kicker}</p>
            <h1 className="font-display text-lg font-bold tracking-tight">{bar.title}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <SinoAlertas count={alertasCount} />
            <Link
              href="/contratos/novo"
              className="inline-flex h-10 items-center rounded-sm bg-brand px-4 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-paper transition hover:bg-brand-2"
            >
              Novo contrato
            </Link>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
