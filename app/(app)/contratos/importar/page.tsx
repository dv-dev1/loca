"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type Campo = { key: string; label: string; req?: boolean; syn: string[] };

const CAMPOS: Campo[] = [
  { key: "imovel", label: "Imóvel", req: true, syn: ["imovel", "endereco", "unidade", "apartamento", "apto", "casa", "imovel/unidade"] },
  { key: "locatario", label: "Locatário", req: true, syn: ["locatario", "inquilino", "cliente", "locataria"] },
  { key: "tipo", label: "Tipo", syn: ["tipo", "categoria", "finalidade"] },
  { key: "aluguel", label: "Aluguel", req: true, syn: ["aluguel", "valor", "valordoaluguel", "mensal", "valormensal"] },
  { key: "indice", label: "Índice de reajuste", syn: ["indice", "reajuste", "igpm", "ipca", "indicedereajuste"] },
  { key: "inicio", label: "Início", syn: ["inicio", "datainicio", "vigenciainicio", "entrada", "iniciovigencia"] },
  { key: "fim", label: "Fim", syn: ["fim", "termino", "datafim", "vigenciafim", "saida", "fimvigencia"] },
  { key: "vencimento", label: "Dia de vencimento", syn: ["vencimento", "dia", "diavencimento", "diadevencimento"] },
  { key: "garantia", label: "Garantia", syn: ["garantia", "caucao", "fiador", "segurofianca"] },
];

const EXEMPLO = `Imóvel;Inquilino;Tipo;Valor;Índice;Início;Término;Vencimento;Garantia
Apto 12 · Ed. Sol;João Mendes;Residencial;2300;IGP-M;01/03/2025;01/03/2027;10;Caução
Loja 5 · Centro;Padaria Trigo ME;Comercial;7800;IPCA;15/06/2024;15/06/2028;05;Fiador
Casa · R. dos Lírios, 88;Patrícia Gomes;Residencial;3450;IGP-M;01/01/2025;01/01/2027;08;Seguro-fiança
Sala 7 · Ed. Horizonte;Clínica Viva;Comercial;5200;IPCA;10/09/2023;10/09/2027;05;Caução
Apto 44 · Ed. Brisa;Lucas e Ana Reis;Residencial;2780;IGP-M;01/05/2025;01/05/2027;12;Fiador`;

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const clean = text.replace(/\r\n?/g, "\n").trim();
  const firstLine = clean.split("\n")[0] ?? "";
  const delim = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  const lines: string[][] = [];
  for (const line of clean.split("\n")) {
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === delim && !inQ) {
        cells.push(cur.trim()); cur = "";
      } else cur += ch;
    }
    cells.push(cur.trim());
    lines.push(cells);
  }
  const headers = lines.shift() ?? [];
  return { headers, rows: lines.filter((r) => r.some((c) => c !== "")) };
}

function autoMap(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  const nh = headers.map(norm);
  for (const campo of CAMPOS) {
    let idx = -1;
    for (let i = 0; i < nh.length; i++) {
      if (campo.syn.some((s) => nh[i] === s || nh[i].includes(s) || s.includes(nh[i]))) { idx = i; break; }
    }
    map[campo.key] = idx;
  }
  return map;
}

export default function ImportarPage() {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  function load(text: string, name: string) {
    const { headers, rows } = parseCSV(text);
    setHeaders(headers);
    setRows(rows);
    setMapping(autoMap(headers));
    setFileName(name);
    setStep(2);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    load(await file.text(), file.name);
  }

  const mapeadas = useMemo(() => CAMPOS.filter((c) => mapping[c.key] >= 0).length, [mapping]);
  const faltamObrig = CAMPOS.filter((c) => c.req && (mapping[c.key] ?? -1) < 0);

  return (
    <div className="mx-auto w-full max-w-[920px]">
      <div className="border-b border-ink/80 pb-5">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint">§ Migração</p>
        <h1 className="mt-1 font-display text-[clamp(1.8rem,3.5vw,2.4rem)] font-extrabold tracking-[-0.02em]">
          Importar da planilha
        </h1>
        <p className="mt-2 text-ink-soft">Traga sua carteira do Excel em poucos minutos. Sem recadastrar nada na mão.</p>
      </div>

      {/* Stepper */}
      <ol className="mt-8 flex items-center gap-6">
        {["Arquivo", "Colunas", "Conferir"].map((s, i) => {
          const num = i + 1;
          const on = step >= num;
          return (
            <li key={s} className="flex items-center gap-2">
              <span className={`grid size-6 place-items-center font-mono text-[0.7rem] ${on ? "bg-brand text-paper" : "border border-line-strong text-ink-faint"}`}>
                {num}
              </span>
              <span className={`font-mono text-[0.72rem] uppercase tracking-[0.12em] ${on ? "text-ink" : "text-ink-faint"}`}>{s}</span>
              {i < 2 && <span className="ml-4 h-px w-8 bg-line-strong" />}
            </li>
          );
        })}
      </ol>

      {/* Passo 1 — Arquivo */}
      {step === 1 && (
        <div className="mt-10">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); void onFile(e.dataTransfer.files?.[0]); }}
            className="flex cursor-pointer flex-col items-center gap-3 border border-dashed border-line-strong px-6 py-16 text-center transition hover:border-brand hover:bg-paper-2"
          >
            <svg viewBox="0 0 24 24" className="size-8 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" /></svg>
            <span className="font-display text-lg font-bold">Solte sua planilha aqui</span>
            <span className="text-sm text-ink-soft">ou clique para selecionar — arquivo <b>.csv</b></span>
            <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
          </label>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button onClick={() => load(EXEMPLO, "exemplo.csv")} className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-brand transition hover:text-brand-2">
              Usar planilha de exemplo →
            </button>
            <span className="font-mono text-[0.7rem] text-ink-faint">No Excel: Arquivo → Salvar como → CSV.</span>
          </div>
        </div>
      )}

      {/* Passo 2 — Colunas */}
      {step === 2 && (
        <div className="mt-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint">
              {fileName} · {rows.length} linhas · {mapeadas} de {CAMPOS.length} colunas reconhecidas
            </span>
            <button onClick={() => setStep(1)} className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-faint transition hover:text-ink">
              Trocar arquivo
            </button>
          </div>

          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {CAMPOS.map((c) => (
              <label key={c.key} className="block">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">
                  {c.label}{c.req && <span className="text-accent-2"> *</span>}
                </span>
                <div className="relative">
                  <select
                    value={mapping[c.key] ?? -1}
                    onChange={(e) => setMapping((m) => ({ ...m, [c.key]: Number(e.target.value) }))}
                    className="mt-2 w-full appearance-none border-b border-ink/25 bg-transparent pb-2 pr-6 outline-none transition focus:border-brand"
                  >
                    <option value={-1}>— não importar —</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h || `Coluna ${i + 1}`}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-0 bottom-2 text-ink-faint">▾</span>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-ink/80 pt-6">
            <button
              disabled={faltamObrig.length > 0}
              onClick={() => setStep(3)}
              className="inline-flex h-[3.25rem] items-center rounded-sm bg-brand px-7 font-semibold text-paper transition hover:bg-brand-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Conferir e importar
            </button>
            {faltamObrig.length > 0 && (
              <span className="text-sm text-danger">
                Faltam mapear: {faltamObrig.map((c) => c.label).join(", ")}.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Passo 3 — Conferir */}
      {step === 3 && (
        <div className="mt-10">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint">
            Pré-visualização · {rows.length} contratos
          </p>
          <div className="mt-4 overflow-x-auto border-t border-ink/80">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  {CAMPOS.filter((c) => (mapping[c.key] ?? -1) >= 0).map((c) => (
                    <th key={c.key} className="whitespace-nowrap py-3 pr-6 text-left font-mono text-[0.66rem] uppercase tracking-[0.1em] text-ink-faint">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 6).map((r, ri) => (
                  <tr key={ri} className="border-b border-line">
                    {CAMPOS.filter((c) => (mapping[c.key] ?? -1) >= 0).map((c) => (
                      <td key={c.key} className="whitespace-nowrap py-3 pr-6">{r[mapping[c.key]] ?? ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 6 && <p className="mt-3 font-mono text-[0.7rem] text-ink-faint">+ {rows.length - 6} contratos não exibidos</p>}

          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-ink/80 pt-6">
            <button onClick={() => setStep(4)} className="inline-flex h-[3.25rem] items-center rounded-sm bg-brand px-7 font-semibold text-paper transition hover:bg-brand-2">
              Importar {rows.length} contratos
            </button>
            <button onClick={() => setStep(2)} className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink">
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* Passo 4 — Concluído */}
      {step === 4 && (
        <div className="mt-12 border-t border-ink/80 pt-12">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.15em] text-accent-2">Tudo certo</p>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-[-0.02em]">
            {rows.length} contratos lidos e prontos.
          </h2>
          <p className="mt-3 max-w-[52ch] text-ink-soft">
            Reconhecemos sua carteira inteira a partir da planilha. Quando o banco de dados
            estiver conectado, isto grava de vez — e os reajustes e vencimentos já entram nos alertas.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link href="/carteira" className="inline-flex h-[3.25rem] items-center rounded-sm bg-brand px-7 font-semibold text-paper transition hover:bg-brand-2">
              Ir para a carteira
            </Link>
            <button onClick={() => { setStep(1); setRows([]); setHeaders([]); setFileName(""); }} className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint transition hover:text-ink">
              Importar outra planilha
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
