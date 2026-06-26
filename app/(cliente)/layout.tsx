import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getProfile } from "@/lib/supabase/profile";

export default async function ClienteLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  // Só locador acessa o portal. Admin volta para a área da imobiliária.
  if (profile && profile.papel !== "locador") redirect("/painel");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-line bg-paper/85 px-5 py-4 backdrop-blur-sm sm:px-8">
        <Link href="/cliente" className="font-display text-xl font-extrabold tracking-tight">
          Locá<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-5">
          {profile?.nome && <span className="hidden text-sm text-ink-soft sm:inline">{profile.nome}</span>}
          <Link
            href="/"
            className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink"
          >
            Sair
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">{children}</main>
    </div>
  );
}
