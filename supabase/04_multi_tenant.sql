-- ============================================================
-- Locá — Fase 4: multi-tenant (várias imobiliárias na mesma base)
-- Rode no Supabase: Dashboard → SQL Editor → New query → cole → Run.
-- Pré-requisito: schema.sql, 02_papeis_rls.sql e 03_anotacoes.sql antes deste.
-- Idempotente: pode rodar mais de uma vez sem erro.
--
-- O que muda: até aqui a base era single-tenant — org_settings tinha uma linha
-- só (check id = 1) e as policies davam a qualquer admin acesso a tudo. Com duas
-- imobiliárias, uma enxergaria os contratos da outra. Este arquivo introduz orgs
-- e reescreve as policies para escopar tudo por org.
--
-- Migração de dados: tudo que já existe é adotado por uma org inicial, para o
-- ambiente atual continuar funcionando exatamente como antes.
-- ============================================================

-- ─── Imobiliárias ───
create table if not exists public.orgs (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  created_at timestamptz not null default now()
);

alter table public.orgs enable row level security;

-- ─── Vínculo usuário ↔ org ───
alter table public.profiles
  add column if not exists org_id uuid references public.orgs(id) on delete cascade;
create index if not exists idx_profiles_org on public.profiles(org_id);

-- ─── Vínculo contrato ↔ org ───
-- org_id fica direto no contrato (em vez de derivar via profiles) de propósito:
-- policy que faz join com profiles vira RLS recursivo e degrada a leitura. Coluna
-- redundante é o padrão recomendado para isolamento por tenant no Supabase.
alter table public.contratos
  add column if not exists org_id uuid references public.orgs(id) on delete cascade;
create index if not exists idx_contratos_org on public.contratos(org_id);

-- reajustes/documentos/anotacoes NÃO levam org_id: herdam do contrato via
-- contrato_id, como as policies já faziam com locador_user_id.

-- ─── Org inicial: adota os dados que já existem ───
do $$
declare
  org_inicial uuid;
begin
  -- Reaproveita a org já criada num run anterior (idempotência), senão cria.
  select id into org_inicial from public.orgs order by created_at limit 1;

  if org_inicial is null then
    insert into public.orgs (nome)
    values (coalesce(
      (select nome from public.org_settings where id = 1),
      'Imobiliária'
    ))
    returning id into org_inicial;
  end if;

  -- Contratos e perfis órfãos passam a pertencer à org inicial.
  update public.contratos set org_id = org_inicial where org_id is null;
  update public.profiles  set org_id = org_inicial where org_id is null;
end $$;

-- ─── org_settings: de linha única para uma linha por org ───
-- Antes: id int primary key default 1 check (id = 1) — o coração do single-tenant.
do $$
declare
  org_inicial uuid;
begin
  select id into org_inicial from public.orgs order by created_at limit 1;

  -- Só migra se ainda estiver no formato antigo (coluna org_id ausente).
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'org_settings' and column_name = 'org_id'
  ) then
    alter table public.org_settings add column org_id uuid references public.orgs(id) on delete cascade;
    update public.org_settings set org_id = org_inicial where org_id is null;

    -- Derruba a restrição de linha única e promove org_id a chave.
    alter table public.org_settings drop constraint if exists org_settings_pkey;
    alter table public.org_settings drop constraint if exists org_settings_id_check;
    alter table public.org_settings alter column id drop default;
    alter table public.org_settings alter column org_id set not null;
    alter table public.org_settings add primary key (org_id);
    alter table public.org_settings drop column if exists id;
  end if;
end $$;

-- ─── Helper: org do usuário atual ───
-- SECURITY DEFINER evita recursão de RLS ao ler profiles de dentro de uma policy
-- (mesmo motivo de is_admin() em 02_papeis_rls.sql).
create or replace function public.current_org_id() returns uuid as $$
  select org_id from public.profiles where id = auth.uid();
$$ language sql security definer stable set search_path = public;

-- ─── RLS por org ───
-- Substitui as policies de 02_papeis_rls.sql: is_admin() sozinho dava a qualquer
-- admin acesso a todos os contratos da base, independente da imobiliária.

-- orgs: cada um enxerga só a própria.
drop policy if exists "membro read org" on public.orgs;
create policy "membro read org" on public.orgs
  for select to authenticated using (id = public.current_org_id());

-- contratos: admin faz tudo dentro da sua org; locador lê os vinculados a ele.
drop policy if exists "admin all contratos" on public.contratos;
drop policy if exists "locador read contratos" on public.contratos;
create policy "admin all contratos" on public.contratos
  for all to authenticated
  using (public.is_admin() and org_id = public.current_org_id())
  with check (public.is_admin() and org_id = public.current_org_id());
create policy "locador read contratos" on public.contratos
  for select to authenticated
  using (locador_user_id = auth.uid() and org_id = public.current_org_id());

-- reajustes: herdam a org do contrato.
drop policy if exists "admin all reajustes" on public.reajustes;
drop policy if exists "locador read reajustes" on public.reajustes;
create policy "admin all reajustes" on public.reajustes
  for all to authenticated
  using (public.is_admin() and exists (
    select 1 from public.contratos c
    where c.id = reajustes.contrato_id and c.org_id = public.current_org_id()))
  with check (public.is_admin() and exists (
    select 1 from public.contratos c
    where c.id = reajustes.contrato_id and c.org_id = public.current_org_id()));
create policy "locador read reajustes" on public.reajustes
  for select to authenticated using (
    exists (select 1 from public.contratos c
            where c.id = reajustes.contrato_id
              and c.locador_user_id = auth.uid()
              and c.org_id = public.current_org_id()));

-- documentos: herdam a org do contrato.
drop policy if exists "admin all documentos" on public.documentos;
drop policy if exists "locador read documentos" on public.documentos;
create policy "admin all documentos" on public.documentos
  for all to authenticated
  using (public.is_admin() and exists (
    select 1 from public.contratos c
    where c.id = documentos.contrato_id and c.org_id = public.current_org_id()))
  with check (public.is_admin() and exists (
    select 1 from public.contratos c
    where c.id = documentos.contrato_id and c.org_id = public.current_org_id()));
create policy "locador read documentos" on public.documentos
  for select to authenticated using (
    exists (select 1 from public.contratos c
            where c.id = documentos.contrato_id
              and c.locador_user_id = auth.uid()
              and c.org_id = public.current_org_id()));

-- anotacoes: herdam a org do contrato.
drop policy if exists "admin all anotacoes" on public.anotacoes;
drop policy if exists "locador read anotacoes" on public.anotacoes;
create policy "admin all anotacoes" on public.anotacoes
  for all to authenticated
  using (public.is_admin() and exists (
    select 1 from public.contratos c
    where c.id = anotacoes.contrato_id and c.org_id = public.current_org_id()))
  with check (public.is_admin() and exists (
    select 1 from public.contratos c
    where c.id = anotacoes.contrato_id and c.org_id = public.current_org_id()));
create policy "locador read anotacoes" on public.anotacoes
  for select to authenticated using (
    exists (select 1 from public.contratos c
            where c.id = anotacoes.contrato_id
              and c.locador_user_id = auth.uid()
              and c.org_id = public.current_org_id()));

-- profiles: cada um lê o próprio; admin gerencia os da sua org.
-- (Antes: admin gerenciava qualquer perfil da base.)
drop policy if exists "self read profile" on public.profiles;
drop policy if exists "admin manage profiles" on public.profiles;
create policy "self read profile" on public.profiles
  for select to authenticated
  using (id = auth.uid() or (public.is_admin() and org_id = public.current_org_id()));
create policy "admin manage profiles" on public.profiles
  for all to authenticated
  using (public.is_admin() and org_id = public.current_org_id())
  with check (public.is_admin() and org_id = public.current_org_id());

-- org_settings: cada org lê e edita só a sua.
drop policy if exists "auth read org" on public.org_settings;
drop policy if exists "admin update org" on public.org_settings;
create policy "membro read org_settings" on public.org_settings
  for select to authenticated using (org_id = public.current_org_id());
create policy "admin update org_settings" on public.org_settings
  for all to authenticated
  using (public.is_admin() and org_id = public.current_org_id())
  with check (public.is_admin() and org_id = public.current_org_id());

-- ─── Novos usuários nascem sem org ───
-- handle_new_user() (02_papeis_rls.sql) cria o profile no signup. A org é
-- atribuída por quem convida (convidarLocador) — nunca herdada de um default,
-- para não haver caminho onde um usuário cai numa org por acidente.

-- ─── Ref única por org ───
-- Antes: ref era unique global (schema.sql). Com multi-tenant cada imobiliária
-- tem sua própria numeração — LOC-0001 pode existir uma vez em cada org.
alter table public.contratos drop constraint if exists contratos_ref_key;
drop index if exists idx_contratos_ref_org;
create unique index if not exists idx_contratos_ref_org on public.contratos(org_id, ref);
