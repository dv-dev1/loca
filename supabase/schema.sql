-- ============================================================
-- Locá — schema de gestão de locação (MVP single-tenant)
-- Rode no Supabase: Dashboard → SQL Editor → New query → cole → Run.
-- ============================================================

create extension if not exists "pgcrypto";

-- ─── Contratos ───
create table if not exists public.contratos (
  id            uuid primary key default gen_random_uuid(),
  ref           text not null unique,
  tipo          text not null default 'Residencial' check (tipo in ('Residencial','Comercial')),
  imovel        text not null,
  endereco      text,
  matricula     text,
  iptu          text,
  locador       text,
  locador_doc   text,
  locatario     text,
  locatario_doc text,
  aluguel       numeric(12,2) not null default 0,
  indice        text default 'IGP-M',        -- IGP-M | IPCA | Fixo
  periodicidade text default 'Anual (12 meses)',
  vencimento_dia int,
  inicio        date,
  fim           date,
  garantia      text,                          -- Caução | Fiador | Seguro-fiança | Capitalização
  status        text not null default 'vigente' check (status in ('vigente','encerrado')),
  owner_id      uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Reajustes (histórico) ───
create table if not exists public.reajustes (
  id             uuid primary key default gen_random_uuid(),
  contrato_id    uuid not null references public.contratos(id) on delete cascade,
  data           date not null,
  indice         text not null,
  valor_anterior numeric(12,2) not null,
  valor_novo     numeric(12,2) not null,
  aplicado       boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ─── Documentos ───
create table if not exists public.documentos (
  id           uuid primary key default gen_random_uuid(),
  contrato_id  uuid not null references public.contratos(id) on delete cascade,
  nome         text not null,
  storage_path text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_reajustes_contrato on public.reajustes(contrato_id);
create index if not exists idx_documentos_contrato on public.documentos(contrato_id);
create index if not exists idx_contratos_fim on public.contratos(fim);

-- updated_at automático
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_contratos_touch on public.contratos;
create trigger trg_contratos_touch before update on public.contratos
  for each row execute function public.touch_updated_at();

-- ─── RLS (MVP: qualquer usuário autenticado da imobiliária) ───
alter table public.contratos  enable row level security;
alter table public.reajustes  enable row level security;
alter table public.documentos enable row level security;

drop policy if exists "auth full contratos" on public.contratos;
create policy "auth full contratos" on public.contratos
  for all to authenticated using (true) with check (true);

drop policy if exists "auth full reajustes" on public.reajustes;
create policy "auth full reajustes" on public.reajustes
  for all to authenticated using (true) with check (true);

drop policy if exists "auth full documentos" on public.documentos;
create policy "auth full documentos" on public.documentos
  for all to authenticated using (true) with check (true);
