"use client";

import { useActionState } from "react";
import { type ConvidarState, convidarLocador } from "./actions";

export type ContratoOpcao = {
  ref: string;
  imovel: string;
  tipo: string;
  vinculado: boolean;
};

const inicial: ConvidarState = { ok: false, message: "" };

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
          {pending ? "Enviando…" : "Convidar locador"}
        </button>
        {state.message && (
          <span className={`text-sm ${state.ok ? "text-accent-2" : "text-danger"}`}>{state.message}</span>
        )}
      </div>

      {state.ok && state.link && (
        <div className="flex flex-col gap-2 border-t border-line pt-5">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">
            Link de acesso — envie ao locador
          </span>
          <input
            readOnly
            value={state.link}
            onFocus={(e) => e.currentTarget.select()}
            className="h-11 rounded-sm border border-line bg-paper-2 px-3 font-mono text-sm outline-none"
          />
        </div>
      )}
    </form>
  );
}
