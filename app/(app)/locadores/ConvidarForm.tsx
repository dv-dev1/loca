"use client";

import { useActionState, useState } from "react";
import { type ConvidarState, convidarLocador } from "./actions";

export type ContratoOpcao = {
  ref: string;
  imovel: string;
  tipo: string;
  vinculado: boolean;
};

const inicial: ConvidarState = { ok: false, message: "" };

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 h-9 rounded-sm border border-line bg-paper px-3 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-soft transition hover:border-brand hover:text-brand"
    >
      {copied ? "Copiado" : label}
    </button>
  );
}

function CredenciaisCard({ email, password }: { email: string; password: string }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="mt-1 rounded-sm border border-line border-t-brand border-t-2 bg-paper-2 p-5 flex flex-col gap-5">
      <p className="text-sm text-ink-soft">{`Acesso criado. Compartilhe os dados abaixo com o locador.`}</p>

      {/* E-mail */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.67rem] uppercase tracking-[0.14em] text-ink-faint">E-mail</span>
        <div className="flex gap-2">
          <input
            readOnly
            value={email}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 h-10 rounded-sm border border-line bg-paper px-3 font-mono text-sm text-ink outline-none"
          />
          <CopyButton value={email} label="Copiar" />
        </div>
      </div>

      {/* Senha */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.67rem] uppercase tracking-[0.14em] text-ink-faint">Senha</span>
        <div className="flex gap-2">
          <input
            readOnly
            type={mostrar ? "text" : "password"}
            value={password}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 h-10 rounded-sm border border-line bg-paper px-3 font-mono text-sm text-ink outline-none"
          />
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            title={mostrar ? "Ocultar senha" : "Mostrar senha"}
            className="shrink-0 h-9 w-9 flex items-center justify-center rounded-sm border border-line bg-paper text-ink-soft transition hover:border-brand hover:text-brand"
          >
            {mostrar ? (
              /* eye-off */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              /* eye */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
          <CopyButton value={password} label="Copiar" />
        </div>
      </div>

      {/* Aviso */}
      <p className="text-[0.8rem] text-ink-soft border-t border-line pt-4">
        <span className="font-semibold text-ink">Salve esta senha agora.</span>{" "}
        Ela não será exibida novamente. Se o locador precisar de novo acesso, gere um novo aqui.
      </p>
    </div>
  );
}

export function ConvidarForm({ contratos }: { contratos: ContratoOpcao[] }) {
  const [state, action, pending] = useActionState(convidarLocador, inicial);

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">Nome</span>
          <input
            name="nome"
            type="text"
            className="h-11 rounded-sm border border-line bg-paper px-3 outline-none transition focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">E-mail</span>
          <input
            name="email"
            type="email"
            required
            className="h-11 rounded-sm border border-line bg-paper px-3 outline-none transition focus:border-brand"
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">
          Contratos deste locador
        </legend>
        {contratos.map((c) => (
          <label
            key={c.ref}
            className="flex items-center gap-3 border-b border-line py-3 last:border-b-0"
          >
            <input type="checkbox" name="refs" value={c.ref} className="size-4 accent-brand" />
            <span className="min-w-0 flex-1">
              <span className="font-semibold">{c.imovel}</span>
              <span className="ml-2 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">
                {c.ref} · {c.tipo}
              </span>
            </span>
            {c.vinculado && (
              <span className="shrink-0 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-ink-soft">
                já vinculado
              </span>
            )}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-[3.25rem] items-center rounded-sm bg-brand px-7 font-semibold text-paper transition hover:bg-brand-2 disabled:opacity-60"
        >
          {pending ? "Criando acesso…" : "Criar acesso"}
        </button>
        {!state.ok && state.message && (
          <span className="text-sm text-danger">{state.message}</span>
        )}
      </div>

      {state.ok && state.email && state.password && (
        <CredenciaisCard email={state.email} password={state.password} />
      )}
    </form>
  );
}
