-- ============================================================
-- Locá — Fase 3: anotações/observações por contrato
-- Rode no Supabase: Dashboard → SQL Editor → New query → cole → Run.
-- Pré-requisito: rodar schema.sql e 02_papeis_rls.sql antes deste.
-- Idempotente: pode rodar mais de uma vez sem erro.
-- ============================================================

create table if not exists public.anotacoes (
  id          uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  texto       text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_anotacoes_contrato on public.anotacoes(contrato_id);

alter table public.anotacoes enable row level security;

drop policy if exists "admin all anotacoes" on public.anotacoes;
create policy "admin all anotacoes" on public.anotacoes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "locador read anotacoes" on public.anotacoes;
create policy "locador read anotacoes" on public.anotacoes
  for select to authenticated using (
    exists (select 1 from public.contratos c
            where c.id = anotacoes.contrato_id and c.locador_user_id = auth.uid())
  );
