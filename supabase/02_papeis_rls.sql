-- ============================================================
-- Locá — Fase 2: papéis (admin/locador), RLS por papel e config da org
-- Rode no Supabase: Dashboard → SQL Editor → New query → cole → Run.
-- Idempotente: pode rodar mais de uma vez sem erro.
-- ============================================================

-- ─── Perfis: papel de cada usuário ───
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  papel      text not null default 'locador' check (papel in ('admin','locador')),
  nome       text,
  created_at timestamptz not null default now()
);

-- Cria o profile automaticamente no signup (novos convidados nascem 'locador').
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, new.raw_user_meta_data->>'nome')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: o usuário atual é admin? (SECURITY DEFINER evita recursão de RLS.)
create or replace function public.is_admin() returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and papel = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- Backfill: promove o usuário de teste a admin (ajuste o e-mail se necessário).
insert into public.profiles (id, papel, nome)
select id, 'admin', 'Imobiliária Demo' from auth.users where email = 'admin@teste.com'
on conflict (id) do update set papel = 'admin';

-- ─── Vínculo locador ↔ contrato ───
alter table public.contratos
  add column if not exists locador_user_id uuid references auth.users(id) on delete set null;
create index if not exists idx_contratos_locador on public.contratos(locador_user_id);

-- ─── RLS por papel ───
-- contratos: admin faz tudo; locador só LÊ os contratos vinculados a ele.
drop policy if exists "auth full contratos" on public.contratos;
drop policy if exists "admin all contratos" on public.contratos;
drop policy if exists "locador read contratos" on public.contratos;
create policy "admin all contratos" on public.contratos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "locador read contratos" on public.contratos
  for select to authenticated using (locador_user_id = auth.uid());

-- reajustes: admin tudo; locador lê os dos seus contratos.
drop policy if exists "auth full reajustes" on public.reajustes;
drop policy if exists "admin all reajustes" on public.reajustes;
drop policy if exists "locador read reajustes" on public.reajustes;
create policy "admin all reajustes" on public.reajustes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "locador read reajustes" on public.reajustes
  for select to authenticated using (
    exists (select 1 from public.contratos c
            where c.id = reajustes.contrato_id and c.locador_user_id = auth.uid())
  );

-- documentos: admin tudo; locador lê os dos seus contratos.
drop policy if exists "auth full documentos" on public.documentos;
drop policy if exists "admin all documentos" on public.documentos;
drop policy if exists "locador read documentos" on public.documentos;
create policy "admin all documentos" on public.documentos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "locador read documentos" on public.documentos
  for select to authenticated using (
    exists (select 1 from public.contratos c
            where c.id = documentos.contrato_id and c.locador_user_id = auth.uid())
  );

-- profiles: cada um lê o próprio; admin gerencia todos.
alter table public.profiles enable row level security;
drop policy if exists "self read profile" on public.profiles;
drop policy if exists "admin manage profiles" on public.profiles;
create policy "self read profile" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "admin manage profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ─── Config da imobiliária (single-tenant: 1 linha) ───
create table if not exists public.org_settings (
  id         int primary key default 1 check (id = 1),
  nome       text not null default 'Imobiliária',
  whatsapp   text,   -- formato E.164 só dígitos, ex.: 5511999998888
  email      text,
  updated_at timestamptz not null default now()
);
insert into public.org_settings (id) values (1) on conflict (id) do nothing;

alter table public.org_settings enable row level security;
drop policy if exists "auth read org" on public.org_settings;
drop policy if exists "admin update org" on public.org_settings;
create policy "auth read org" on public.org_settings
  for select to authenticated using (true);
create policy "admin update org" on public.org_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
