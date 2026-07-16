-- ============================================================
-- Locá — Fase 5: chatbot do contrato (base de conhecimento = documentos)
-- Rode no Supabase: Dashboard → SQL Editor → New query → cole → Run.
-- Pré-requisito: schema.sql, 02, 03 e 04 antes deste.
-- Idempotente: pode rodar mais de uma vez sem erro.
--
-- O chatbot responde dúvidas sobre um contrato usando o texto dos PDFs anexados.
-- Extrair o texto do PDF a cada pergunta seria caro e lento (re-download +
-- re-parse). Esta coluna guarda o texto extraído uma vez, no upload.
-- ============================================================

alter table public.documentos
  add column if not exists texto text;

-- Sem índice: o texto é lido junto com a linha do documento pelo contrato_id,
-- que já é indexado (idx_documentos_contrato). Full-text search fica para depois,
-- se o volume por contrato justificar.
