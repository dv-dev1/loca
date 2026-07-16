"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Contrato } from "@/app/_data/contratos";
import { Anotacoes } from "./Anotacoes";
import { ChatContrato } from "./ChatContrato";
import { apagarContrato } from "./actions";

type CampoKey =
  | "endereco"
  | "tipo"
  | "matricula"
  | "iptu"
  | "locador"
  | "locadorDoc"
  | "locatario"
  | "locatarioDoc"
  | "aluguel"
  | "indice"
  | "periodicidade"
  | "vencimentoDia"
  | "garantia";

export function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-2 flex items-baseline gap-3">
      <span className="font-mono text-sm text-accent-2">{n}</span>
      <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function Def({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-3">
      <dt className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className={`text-right ${mono ? "font-mono" : ""} ${mono ? "font-medium" : "font-semibold"}`}>{value}</dd>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-baseline justify-between gap-6 border-b border-line py-2">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-1/2 border-b border-ink/25 bg-transparent text-right outline-none focus:border-brand"
      />
    </label>
  );
}

export function ContratoCorpo({ contrato }: { contrato: Contrato }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(contrato);
  const [draft, setDraft] = useState(contrato);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);
  const [apagando, startApagar] = useTransition();

  function apagar() {
    startApagar(async () => {
      const resultado = await apagarContrato(contrato.ref);
      if (!resultado.ok) {
        setErroExclusao(resultado.message ?? "Não foi possível apagar o contrato.");
        return;
      }
      router.push("/carteira");
    });
  }

  function startEdit() {
    setDraft(saved);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
  }

  function save() {
    setSaved(draft);
    setEditing(false);
  }

  function setCampo(key: CampoKey, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const c = editing ? draft : saved;

  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-10">
        <section>
          <SectionTitle n="01" title="Imóvel" />
          <dl>
            {editing ? (
              <>
                <EditField label="Endereço" value={c.endereco} onChange={(v) => setCampo("endereco", v)} />
                <EditField label="Tipo" value={c.tipo} onChange={(v) => setCampo("tipo", v)} />
                <EditField label="Matrícula" value={c.matricula} onChange={(v) => setCampo("matricula", v)} />
                <EditField label="Inscrição IPTU" value={c.iptu} onChange={(v) => setCampo("iptu", v)} />
              </>
            ) : (
              <>
                <Def label="Endereço" value={c.endereco} />
                <Def label="Tipo" value={c.tipo} />
                <Def label="Matrícula" value={c.matricula} mono />
                <Def label="Inscrição IPTU" value={c.iptu} mono />
              </>
            )}
          </dl>
        </section>
        <section>
          <SectionTitle n="02" title="Partes" />
          <dl>
            {editing ? (
              <>
                <EditField label="Locador" value={c.locador} onChange={(v) => setCampo("locador", v)} />
                <EditField label="CPF / CNPJ" value={c.locadorDoc} onChange={(v) => setCampo("locadorDoc", v)} />
                <EditField label="Locatário" value={c.locatario} onChange={(v) => setCampo("locatario", v)} />
                <EditField label="CPF / CNPJ" value={c.locatarioDoc} onChange={(v) => setCampo("locatarioDoc", v)} />
              </>
            ) : (
              <>
                <Def label="Locador" value={c.locador} />
                <Def label="CPF / CNPJ" value={c.locadorDoc} mono />
                <Def label="Locatário" value={c.locatario} />
                <Def label="CPF / CNPJ" value={c.locatarioDoc} mono />
              </>
            )}
          </dl>
        </section>
        <section>
          <SectionTitle n="03" title="Locação" />
          <dl>
            {editing ? (
              <>
                <EditField label="Aluguel" value={c.aluguel} onChange={(v) => setCampo("aluguel", v)} />
                <EditField label="Índice de reajuste" value={c.indice} onChange={(v) => setCampo("indice", v)} />
                <EditField label="Periodicidade" value={c.periodicidade} onChange={(v) => setCampo("periodicidade", v)} />
                <Def label="Vigência" value={`${c.inicio} — ${c.fim}`} mono />
                <EditField label="Dia de vencimento" value={c.vencimentoDia} onChange={(v) => setCampo("vencimentoDia", v)} />
                <EditField label="Garantia" value={c.garantia} onChange={(v) => setCampo("garantia", v)} />
              </>
            ) : (
              <>
                <Def label="Aluguel" value={c.aluguel} mono />
                <Def label="Índice de reajuste" value={c.indice} />
                <Def label="Periodicidade" value={c.periodicidade} />
                <Def label="Vigência" value={`${c.inicio} — ${c.fim}`} mono />
                <Def label="Dia de vencimento" value={c.vencimentoDia} mono />
                <Def label="Garantia" value={c.garantia} />
              </>
            )}
          </dl>
        </section>

        <ChatContrato contratoRef={contrato.ref} />
      </div>

      <div className="flex flex-col gap-10">
        <section>
          <SectionTitle n="04" title="Documentos" />
          <ul>
            {contrato.documentos.map((d) => (
              <li key={d} className="flex items-center justify-between gap-4 border-b border-line py-3">
                <span className="flex items-center gap-3 min-w-0">
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></svg>
                  <span className="truncate text-sm">{d}</span>
                </span>
                <a
                  href={`/api/doc?ref=${contrato.ref}&nome=${encodeURIComponent(d)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-brand transition hover:text-brand-2"
                >
                  Baixar
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionTitle n="05" title="Histórico de reajustes" />
          <ul>
            {contrato.reajustes.map((r) => (
              <li key={r.data} className="border-b border-line py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-sm">{r.data}</span>
                  <span className="font-mono text-[0.72rem] text-accent-2">{r.indice}</span>
                </div>
                <div className="mt-1 text-right font-mono text-sm">
                  <s className="text-ink-faint no-underline">{r.de}</s>{" "}
                  <span className="text-ink-faint">→</span>{" "}
                  <b className="font-semibold">{r.para}</b>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-3">
          {editing ? (
            <>
              <button type="button" onClick={save} className="inline-flex h-12 items-center justify-center rounded-sm bg-brand font-semibold text-paper transition hover:bg-brand-2">
                Salvar
              </button>
              <button type="button" onClick={cancel} className="inline-flex h-12 items-center justify-center rounded-sm border border-ink/25 font-semibold transition hover:border-ink">
                Cancelar
              </button>
            </>
          ) : (
            <button type="button" onClick={startEdit} className="inline-flex h-12 items-center justify-center rounded-sm bg-brand font-semibold text-paper transition hover:bg-brand-2">
              Editar contrato
            </button>
          )}
          <a
            href={`/contratos/${contrato.ref}/pdf`}
            download
            className="inline-flex h-12 items-center justify-center rounded-sm border border-ink/25 font-semibold transition hover:border-ink"
          >
            Baixar contrato (PDF)
          </a>

          {!editing &&
            (confirmandoExclusao ? (
              <div className="flex flex-col gap-3 rounded-sm border border-danger/40 bg-danger/5 p-4">
                <p className="text-sm text-danger">
                  Apagar remove também o histórico de reajustes e os documentos vinculados. Essa ação não pode ser
                  desfeita.
                </p>
                {erroExclusao && <p className="text-sm font-semibold text-danger">{erroExclusao}</p>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={apagar}
                    disabled={apagando}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-sm bg-danger font-semibold text-paper transition hover:bg-danger/90 disabled:opacity-60"
                  >
                    {apagando ? "Apagando…" : "Confirmar exclusão"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmandoExclusao(false);
                      setErroExclusao(null);
                    }}
                    disabled={apagando}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-sm border border-ink/25 font-semibold transition hover:border-ink disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="inline-flex h-12 items-center justify-center rounded-sm border border-danger/40 font-semibold text-danger transition hover:bg-danger/5"
              >
                Apagar contrato
              </button>
            ))}
        </div>

        <Anotacoes contratoRef={contrato.ref} anotacoesIniciais={contrato.anotacoes} />
      </div>
    </div>
  );
}
