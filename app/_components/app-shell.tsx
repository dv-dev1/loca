"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/painel", label: "Painel", meta: "Visão da carteira" },
  { href: "/carteira", label: "Carteira", meta: "Contratos vigentes" },
  { href: "/diagnostico", label: "Diagnóstico", meta: "Raio-X da carteira" },
  { href: "/contratos/novo", label: "Novo contrato", meta: "Cadastrar" },
  { href: "/contratos/importar", label: "Importar", meta: "Da planilha" },
];

function topbar(pathname: string): { kicker: string; title: string } {
  if (pathname.startsWith("/carteira")) return { kicker: "§ Carteira", title: "Contratos vigentes" };
  if (pathname.startsWith("/contratos/novo")) return { kicker: "§ Contratos", title: "Novo contrato" };
  if (pathname.startsWith("/contratos/importar")) return { kicker: "§ Migração", title: "Importar da planilha" };
  if (pathname.startsWith("/contratos/")) return { kicker: "§ Contrato", title: "Detalhe do contrato" };
  if (pathname.startsWith("/diagnostico")) return { kicker: "§ Diagnóstico", title: "Raio-X da carteira" };
  if (pathname.startsWith("/painel")) return { kicker: "§ Painel", title: "Visão da carteira" };
  return { kicker: "§ Locá", title: "Gestão de locação" };
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bar = topbar(pathname);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-paper-2 px-5 py-6 md:flex">
        <Link href="/" className="px-2 font-display text-xl font-extrabold tracking-tight">
          Locá<span className="text-accent">.</span>
        </Link>

        <nav className="mt-10 flex flex-1 flex-col gap-1" aria-label="Navegação">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-sm px-3 py-2.5 transition ${
                  active ? "bg-paper" : "hover:bg-paper/60"
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 bg-accent" />}
                <span className={`block text-sm font-semibold ${active ? "text-brand" : "text-ink"}`}>
                  {item.label}
                </span>
                <span className="block font-mono text-[0.66rem] uppercase tracking-[0.1em] text-ink-faint">
                  {item.meta}
                </span>
              </Link>
            );
          })}
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
          <Link
            href="/contratos/novo"
            className="inline-flex h-10 items-center rounded-sm bg-brand px-4 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-paper transition hover:bg-brand-2"
          >
            Novo contrato
          </Link>
        </header>

        <main className="px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
