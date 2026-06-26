import Link from "next/link";
import type { ReactNode } from "react";
import { criarContrato } from "./actions";

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

function Field({ label, name, placeholder, type = "text", full = false, required = false }: { label: string; name: string; placeholder: string; type?: string; full?: boolean; required?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full border-b border-ink/25 bg-transparent pb-2 text-ink outline-none transition placeholder:text-ink-faint/70 focus:border-brand"
      />
    </label>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="block">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">{label}</span>
      <div className="relative">
        <select name={name} className="mt-2 w-full appearance-none border-b border-ink/25 bg-transparent pb-2 pr-6 text-ink outline-none transition focus:border-brand">
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-0 bottom-2 text-ink-faint">▾</span>
      </div>
    </label>
  );
}

export default function NovoContratoPage() {
  return (
    <div className="mx-auto w-full max-w-[860px]">
      <div className="border-b border-ink/80 pb-5">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint">§ Cadastro</p>
        <h1 className="mt-1 font-display text-[clamp(1.8rem,3.5vw,2.4rem)] font-extrabold tracking-[-0.02em]">
          Novo contrato de locação
        </h1>
      </div>

      <form action={criarContrato} className="mt-12 flex flex-col gap-14">
        <Section n="01" title="Imóvel">
          <Field label="Identificação do imóvel" name="imovel" placeholder="Ex.: Casa · R. das Acácias, 120" full required />
          <Field label="Endereço completo" name="endereco" placeholder="Rua, número, complemento — bairro" full />
          <Select label="Tipo" name="tipo" options={["Residencial", "Comercial"]} />
          <Field label="Matrícula" name="matricula" placeholder="Nº da matrícula" />
          <Field label="Inscrição de IPTU" name="iptu" placeholder="Nº da inscrição" />
        </Section>

        <div className="border-t border-line" />

        <Section n="02" title="Partes">
          <Field label="Locador (proprietário)" name="locador" placeholder="Nome completo" />
          <Field label="CPF / CNPJ do locador" name="locadorDoc" placeholder="000.000.000-00" />
          <Field label="Locatário (inquilino)" name="locatario" placeholder="Nome completo" />
          <Field label="CPF / CNPJ do locatário" name="locatarioDoc" placeholder="000.000.000-00" />
        </Section>

        <div className="border-t border-line" />

        <Section n="03" title="Locação">
          <Field label="Valor do aluguel" name="aluguel" placeholder="R$ 0,00" />
          <Select label="Índice de reajuste" name="indice" options={["IGP-M", "IPCA", "Índice fixo"]} />
          <Field label="Início da vigência" name="inicio" placeholder="dd/mm/aaaa" type="date" required />
          <Field label="Fim da vigência" name="fim" placeholder="dd/mm/aaaa" type="date" required />
          <Field label="Dia de vencimento" name="vencimentoDia" placeholder="Ex.: 10" />
          <Select label="Garantia" name="garantia" options={["Caução", "Fiador", "Seguro-fiança", "Título de capitalização"]} />
        </Section>

        <div className="border-t border-line" />

        <Section n="04" title="Documentos">
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer flex-col items-start gap-2 border border-dashed border-line-strong px-6 py-8 transition hover:border-brand hover:bg-paper-2">
              <span className="font-semibold">Anexar documentos</span>
              <span className="text-sm text-ink-soft">
                Contrato, matrícula, IPTU e aditivos. PDF ou imagem.
              </span>
              <span className="mt-2 inline-flex h-9 items-center rounded-sm border border-ink/25 px-4 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-soft">
                Selecionar arquivos
              </span>
              <input type="file" multiple accept=".pdf,image/*" className="sr-only" />
            </label>
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
    </div>
  );
}
