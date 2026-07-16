"use client";

import { useRef, useState, useTransition } from "react";
import { perguntarSobreContrato } from "./chat-actions";
import { SectionTitle } from "./ContratoCorpo";

type Turno = { pergunta: string; resposta: string | null; erro: string | null };

const SUGESTOES = ["Qual é o índice de reajuste?", "Qual a multa por rescisão?", "Quando vence o contrato?"];

export function ChatContrato({ contratoRef }: { contratoRef: string }) {
  const [pergunta, setPergunta] = useState("");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [enviando, startEnviar] = useTransition();
  const listaRef = useRef<HTMLDivElement>(null);

  function enviar(texto: string) {
    const p = texto.trim();
    if (!p || enviando) return;

    // Monta o histórico a partir dos turnos já respondidos (ignora os que
    // falharam ou ainda estão carregando), para o modelo entender perguntas
    // de acompanhamento. Só o que foi efetivamente pergunta+resposta.
    const historico = turnos
      .filter((t) => t.resposta !== null)
      .flatMap((t) => [
        { autor: "usuario" as const, texto: t.pergunta },
        { autor: "assistente" as const, texto: t.resposta as string },
      ]);

    setPergunta("");
    const indice = turnos.length;
    setTurnos((prev) => [...prev, { pergunta: p, resposta: null, erro: null }]);

    startEnviar(async () => {
      const r = await perguntarSobreContrato(contratoRef, p, historico);
      setTurnos((prev) =>
        prev.map((t, i) =>
          i === indice
            ? r.ok
              ? { ...t, resposta: r.resposta }
              : { ...t, erro: r.message }
            : t,
        ),
      );
      requestAnimationFrame(() => listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight }));
    });
  }

  return (
    <section>
      <SectionTitle n="06" title="Assistente do contrato" />
      <p className="mb-4 text-sm text-ink-soft">
        Pergunte sobre as cláusulas deste contrato. As respostas saem dos documentos anexados — não é aconselhamento
        jurídico.
      </p>

      {turnos.length > 0 && (
        <div ref={listaRef} className="mb-4 flex max-h-[22rem] flex-col gap-4 overflow-y-auto">
          {turnos.map((t, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-sm bg-brand px-3 py-2 text-sm text-paper">{t.pergunta}</p>
              </div>
              <div className="flex justify-start">
                {t.resposta === null && t.erro === null ? (
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">Consultando…</p>
                ) : t.erro ? (
                  <p className="max-w-[85%] rounded-sm border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
                    {t.erro}
                  </p>
                ) : (
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-sm border border-line bg-paper-2 px-3 py-2 text-sm">
                    {t.resposta}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {turnos.length === 0 && (
        <div className="mb-4">
          <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink-faint">
            Sugestões — ou escreva a sua abaixo
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => enviar(s)}
                className="rounded-sm border border-line px-3 py-1.5 text-left text-sm text-ink-soft transition hover:border-ink hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(pergunta);
        }}
        className="flex items-center gap-2 border-t border-ink/80 pt-4"
      >
        <input
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          placeholder="Escreva sua pergunta…"
          className="h-11 flex-1 border-b border-ink/25 bg-transparent px-1 outline-none transition focus:border-brand"
        />
        <button
          type="submit"
          disabled={enviando || !pergunta.trim()}
          className="inline-flex h-11 items-center justify-center rounded-sm bg-brand px-5 font-semibold text-paper transition hover:bg-brand-2 disabled:opacity-50"
        >
          {enviando ? "…" : "Perguntar"}
        </button>
      </form>
    </section>
  );
}
