import Link from "next/link";

function Field({ label, type = "text", placeholder, autoComplete }: { label: string; type?: string; placeholder: string; autoComplete?: string }) {
  return (
    <label className="block">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-ink-faint">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 w-full border-b border-ink/25 bg-transparent pb-2 text-lg text-ink outline-none transition placeholder:text-ink-faint/70 focus:border-brand"
      />
    </label>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Painel de marca */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-deep px-12 py-12 lg:flex">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-tight text-paper">
          Locá<span className="text-accent">.</span>
        </Link>

        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent">Gestão de locação</p>
          <p className="mt-6 max-w-[18ch] font-display text-[clamp(2.2rem,3.5vw,3.2rem)] font-bold leading-[1.02] tracking-[-0.03em] text-paper">
            Toda a carteira de locação <span className="text-accent">sob controle</span>.
          </p>
        </div>

        {/* régua decorativa */}
        <div className="relative border-t border-paper/25 pt-4">
          <span className="absolute -top-[5px] left-0 size-2 bg-paper" />
          <span className="absolute -top-[6px] left-[58%] size-3 -translate-x-1/2 bg-accent" />
          <span className="absolute -top-[5px] right-0 size-2 bg-paper" />
          <div className="flex justify-between font-mono text-[0.66rem] uppercase tracking-[0.12em] text-paper/55">
            <span>início</span>
            <span className="text-accent">reajuste</span>
            <span>vencimento</span>
          </div>
        </div>
      </aside>

      {/* Formulário */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-[26rem]">
          <Link href="/" className="font-display text-xl font-extrabold tracking-tight lg:hidden">
            Locá<span className="text-accent">.</span>
          </Link>

          <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint lg:mt-0">§ Acesso</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em]">Entrar</h1>
          <p className="mt-3 text-ink-soft">Acesse o painel da sua imobiliária.</p>

          <form className="mt-10 flex flex-col gap-7">
            <Field label="E-mail" type="email" placeholder="voce@imobiliaria.com.br" autoComplete="email" />
            <Field label="Senha" type="password" placeholder="••••••••" autoComplete="current-password" />

            <div className="mt-2 flex flex-col gap-4">
              <Link
                href="/painel"
                className="inline-flex h-[3.25rem] items-center justify-center rounded-sm bg-brand font-semibold text-paper transition hover:bg-brand-2"
              >
                Entrar no painel
              </Link>
              <a href="#" className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink">
                Esqueci minha senha
              </a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
