"use client";

import { useEffect, useRef, useState } from "react";

/** `extraFile`: PDF já usado na extração automática — entra sozinho na lista de documentos. */
export function FilePicker({ extraFile }: { extraFile?: File | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [nomes, setNomes] = useState<string[]>([]);
  const extraFileInjetado = useRef<File | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNomes(Array.from(e.currentTarget.files ?? []).map((f) => f.name));
  }

  useEffect(() => {
    if (!extraFile || extraFile === extraFileInjetado.current || !inputRef.current) return;

    const atuais = Array.from(inputRef.current.files ?? []);
    const jaSelecionado = atuais.some((f) => f.name === extraFile.name && f.size === extraFile.size);
    extraFileInjetado.current = extraFile;
    if (jaSelecionado) return;

    const dataTransfer = new DataTransfer();
    for (const f of atuais) dataTransfer.items.add(f);
    dataTransfer.items.add(extraFile);
    inputRef.current.files = dataTransfer.files;
    setNomes(Array.from(dataTransfer.files).map((f) => f.name));
  }, [extraFile]);

  return (
    <label className="flex cursor-pointer flex-col items-start gap-2 border border-dashed border-line-strong px-6 py-8 transition hover:border-brand hover:bg-paper-2">
      <span className="font-semibold">Anexar documentos</span>
      <span className="text-sm text-ink-soft">Contrato, matrícula, IPTU e aditivos. PDF ou imagem.</span>

      <span
        role="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2 inline-flex h-9 items-center rounded-sm border border-ink/25 px-4 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-soft"
      >
        Selecionar arquivos
      </span>

      {nomes.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {nomes.map((n) => (
            <li key={n} className="flex items-center gap-2 text-sm text-ink">
              <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <path d="M14 3v6h6" />
              </svg>
              {n}
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        name="documentos"
        type="file"
        multiple
        accept=".pdf,image/*"
        onChange={handleChange}
        className="sr-only"
      />
    </label>
  );
}
