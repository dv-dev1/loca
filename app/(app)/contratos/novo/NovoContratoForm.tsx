"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { brl } from "@/app/_data/contratos";
import { GARANTIA_OPCOES, INDICE_OPCOES, TIPO_OPCOES } from "@/lib/contratos/opcoes";
import type { CampoContratoIA } from "@/lib/ia/extrair-contrato";
import { criarContrato, extrairContrato } from "./actions";
import { FilePicker } from "./FilePicker";

type CampoKey =
  | "imovel" | "endereco" | "tipo" | "matricula" | "iptu"
  | "locador" | "locadorDoc" | "locatario" | "locatarioDoc"
  | "aluguel" | "indice" | "inicio" | "fim" | "vencimentoDia" | "garantia";

const CAMPOS_INICIAIS: Record<CampoKey, string> = {
  imovel: "", endereco: "", tipo: TIPO_OPCOES[0], matricula: "", iptu: "",
  locador: "", locadorDoc: "", locatario: "", locatarioDoc: "",
  aluguel: "", indice: INDICE_OPCOES[0], inicio: "", fim: "", vencimentoDia: "", garantia: GARANTIA_OPCOES[0],
};

/** Mescla no state só os campos que a IA extraiu com confiança (não-nulos/vazios). */
function mesclarExtracao(atual: Record<CampoKey, string>, dados: CampoContratoIA): Record<CampoKey, string> {
  const proximo = { ...atual };
  for (const chave of Object.keys(dados) as (keyof CampoContratoIA)[]) {
    const valor = dados[chave];
    if (valor === null || valor === "") continue;
    if (chave === "aluguel") {
      const numero = Number(valor);
      proximo.aluguel = Number.isFinite(numero) ? brl(numero) : valor;
    } else {
      proximo[chave as CampoKey] = valor;
    }
  }
  return proximo;
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 sm:grid-cols-[5rem_1fr] sm:gap-8">
      <div className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
        <span className="font-mono text-sm text-accent-2">{n}</span>
        <h2 className="font-display text-lg font-bold tracking-tight sm:text-base">{title}</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label, name, value, onChange, placeholder, type = "text", full = false, required = false,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; full?: boolean; required?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-ink/25 bg-transparent pb-2 text-ink outline-none transition placeholder:text-ink-faint/70 focus:border-brand"
      />
    </label>
  );
}

function Select({
  label, name, value, onChange, options,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void; options: readonly string[];
}) {
  return (
    <label className="block">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">{label}</span>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full appearance-none border-b border-ink/25 bg-transparent pb-2 pr-6 text-ink outline-none transition focus:border-brand"
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-0 bottom-2 text-ink-faint">▾</span>
      </div>
    </label>
  );
}

function DropzoneExtracao({
  extraindo, erro, onArquivo,
}: {
  extraindo: boolean; erro: string | null; onArquivo: (file: File | undefined) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onArquivo(e.dataTransfer.files?.[0]); }}
        className="flex cursor-pointer flex-col items-center gap-3 border border-dashed border-line-strong px-6 py-10 text-center transition hover:border-brand hover:bg-paper-2"
      >
        <svg viewBox="0 0 24 24" className="size-8 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
        </svg>
        <span className="font-display text-lg font-bold">Solte o contrato assinado aqui</span>
        <span className="text-sm text-ink-soft">PDF — a plataforma lê o documento e preenche o formulário abaixo</span>
        <input
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => onArquivo(e.target.files?.[0])}
        />
      </label>
      {extraindo && (
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-faint">Lendo o PDF…</p>
      )}
      {erro && !extraindo && (
        <p className="font-mono text-[0.72rem] text-danger">{erro}</p>
      )}
    </section>
  );
}

export function NovoContratoForm({ openaiConfigured }: { openaiConfigured: boolean }) {
  const [campos, setCampos] = useState<Record<CampoKey, string>>(CAMPOS_INICIAIS);
  const [arquivoContrato, setArquivoContrato] = useState<File | null>(null);
  const [extraindo, setExtraindo] = useState(false);
  const [erroExtracao, setErroExtracao] = useState<string | null>(null);

  function setCampo(chave: CampoKey, valor: string) {
    setCampos((prev) => ({ ...prev, [chave]: valor }));
  }

  async function onArquivoContrato(file: File | undefined) {
    if (!file) return;
    setArquivoContrato(file);
    setErroExtracao(null);
    setExtraindo(true);
    try {
      const fd = new FormData();
      fd.set("arquivo", file);
      const resposta = await extrairContrato(fd);
      if (resposta.ok) {
        setCampos((prev) => mesclarExtracao(prev, resposta.dados));
      } else {
        setErroExtracao(resposta.message);
      }
    } catch {
      setErroExtracao("Não foi possível processar o PDF agora. Preencha os campos manualmente.");
    } finally {
      setExtraindo(false);
    }
  }

  return (
    <form action={criarContrato} className="mt-12 flex flex-col gap-14">
      {openaiConfigured && (
        <DropzoneExtracao extraindo={extraindo} erro={erroExtracao} onArquivo={onArquivoContrato} />
      )}

      <Section n="01" title="Imóvel">
        <Field label="Identificação do imóvel" name="imovel" value={campos.imovel} onChange={(v) => setCampo("imovel", v)} placeholder="Ex.: Casa · R. das Acácias, 120" full required />
        <Field label="Endereço completo" name="endereco" value={campos.endereco} onChange={(v) => setCampo("endereco", v)} placeholder="Rua, número, complemento — bairro" full />
        <Select label="Tipo" name="tipo" value={campos.tipo} onChange={(v) => setCampo("tipo", v)} options={TIPO_OPCOES} />
        <Field label="Matrícula" name="matricula" value={campos.matricula} onChange={(v) => setCampo("matricula", v)} placeholder="Nº da matrícula" />
        <Field label="Inscrição de IPTU" name="iptu" value={campos.iptu} onChange={(v) => setCampo("iptu", v)} placeholder="Nº da inscrição" />
      </Section>

      <div className="border-t border-line" />

      <Section n="02" title="Partes">
        <Field label="Locador (proprietário)" name="locador" value={campos.locador} onChange={(v) => setCampo("locador", v)} placeholder="Nome completo" required />
        <Field label="CPF / CNPJ do locador" name="locadorDoc" value={campos.locadorDoc} onChange={(v) => setCampo("locadorDoc", v)} placeholder="000.000.000-00" />
        <Field label="Locatário (inquilino)" name="locatario" value={campos.locatario} onChange={(v) => setCampo("locatario", v)} placeholder="Nome completo" required />
        <Field label="CPF / CNPJ do locatário" name="locatarioDoc" value={campos.locatarioDoc} onChange={(v) => setCampo("locatarioDoc", v)} placeholder="000.000.000-00" />
      </Section>

      <div className="border-t border-line" />

      <Section n="03" title="Locação">
        <Field label="Valor do aluguel" name="aluguel" value={campos.aluguel} onChange={(v) => setCampo("aluguel", v)} placeholder="R$ 0,00" />
        <Select label="Índice de reajuste" name="indice" value={campos.indice} onChange={(v) => setCampo("indice", v)} options={INDICE_OPCOES} />
        <Field label="Início da vigência" name="inicio" value={campos.inicio} onChange={(v) => setCampo("inicio", v)} placeholder="dd/mm/aaaa" type="date" required />
        <Field label="Fim da vigência" name="fim" value={campos.fim} onChange={(v) => setCampo("fim", v)} placeholder="dd/mm/aaaa" type="date" required />
        <Field label="Dia de vencimento" name="vencimentoDia" value={campos.vencimentoDia} onChange={(v) => setCampo("vencimentoDia", v)} placeholder="Ex.: 10" />
        <Select label="Garantia" name="garantia" value={campos.garantia} onChange={(v) => setCampo("garantia", v)} options={GARANTIA_OPCOES} />
      </Section>

      <div className="border-t border-line" />

      <Section n="04" title="Documentos">
        <div className="sm:col-span-2">
          <FilePicker extraFile={arquivoContrato} />
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-ink/80 pt-8">
        <button
          type="submit"
          className="inline-flex h-[3.25rem] items-center rounded-sm bg-brand px-7 font-semibold text-paper transition hover:bg-brand-2"
        >
          Salvar contrato
        </button>
        <Link href="/carteira" className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
