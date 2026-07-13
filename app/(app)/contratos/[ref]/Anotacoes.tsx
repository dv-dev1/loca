"use client";

import { useState, useTransition } from "react";
import type { Anotacao } from "@/app/_data/contratos";
import { adicionarAnotacao } from "./actions";
import { SectionTitle } from "./ContratoCorpo";

export function Anotacoes({
  contratoRef,
  anotacoesIniciais,
}: {
  contratoRef: string;
  anotacoesIniciais: Anotacao[];
}) {
  const [anotacoes, setAnotacoes] = useState(anotacoesIniciais);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, startSalvar] = useTransition();

  function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    startSalvar(async () => {
      const resultado = await adicionarAnotacao(contratoRef, texto);
      if (!resultado.ok) {
        setErro(resultado.message);
        return;
      }
      setAnotacoes((prev) => [resultado.anotacao, ...prev]);
      setTexto("");
    });
  }

  return (
    <section>
      <SectionTitle n="06" title="Observações" />

      <form onSubmit={adicionar} className="flex flex-col gap-2">
        <label className="flex flex-col gap-2">
          <span className="sr-only">Nova observação</span>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva uma observação sobre este contrato…"
            rows={3}
            className="w-full resize-none border-b border-ink/25 bg-transparent py-2 text-sm outline-none placeholder:text-ink-faint/70 focus:border-brand"
          />
        </label>
        {erro && <p className="text-sm text-danger">{erro}</p>}
        <button
          type="submit"
          disabled={salvando || !texto.trim()}
          className="inline-flex h-10 items-center justify-center self-start rounded-sm bg-brand px-4 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-paper transition hover:bg-brand-2 disabled:opacity-60"
        >
          {salvando ? "Salvando…" : "Adicionar observação"}
        </button>
      </form>

      <ul className="mt-4 flex flex-col gap-3">
        {anotacoes.length === 0 && <li className="text-sm text-ink-faint">Nenhuma observação registrada.</li>}
        {anotacoes.map((a) => (
          <li key={a.id} className="border-b border-line pb-3">
            <p className="text-sm">{a.texto}</p>
            <p className="mt-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-ink-faint">{a.criadoEm}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
