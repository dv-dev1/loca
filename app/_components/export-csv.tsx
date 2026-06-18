"use client";

import { CONTRATOS } from "@/app/_data/contratos";

const HEADERS = [
  "Referência", "Imóvel", "Endereço", "Tipo", "Locador", "Locatário",
  "Aluguel", "Índice", "Vencimento (dia)", "Início", "Fim", "Garantia", "Próximo evento", "Data",
];

export function ExportCsv() {
  function exportar() {
    const rows = CONTRATOS.map((c) => [
      c.ref, c.imovel, c.endereco, c.tipo, c.locador, c.locatario,
      c.aluguel, c.indice, c.vencimentoDia, c.inicio, c.fim, c.garantia, c.evento, c.data,
    ]);
    const csv = [HEADERS, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "carteira-loca.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportar}
      className="inline-flex h-9 items-center rounded-sm border border-ink/25 px-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-soft transition hover:border-ink hover:text-ink"
    >
      Exportar CSV
    </button>
  );
}
