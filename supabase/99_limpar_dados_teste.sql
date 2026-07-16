-- ============================================================
-- Locá — limpar dados de teste (pré-apresentação)
-- Rode no Supabase: Dashboard → SQL Editor → New query → cole → Run.
--
-- Zera contratos, reajustes, documentos e anotações da imobiliária de teste,
-- para rodar contratos novos e validar alertas/vencimentos do zero antes de
-- apresentar. NÃO apaga imobiliárias (orgs) nem usuários — só os dados de
-- locação.
--
-- DESTRUTIVO. Não é idempotente-seguro no sentido de "sem efeito": apaga de
-- verdade. Rode com consciência. O modo demo (app/_data/contratos.ts) é outra
-- coisa e continua intacto — ele não vive no banco.
--
-- Por padrão limpa TODAS as orgs. Para limpar só uma, descomente o filtro
-- e ponha o id da org.
-- ============================================================

begin;

-- Descomente e ajuste para limitar a uma imobiliária:
-- \set org_alvo '00000000-0000-0000-0000-000000000000'

-- reajustes/documentos/anotacoes caem por cascade ao apagar o contrato
-- (on delete cascade no schema), mas apagamos explicitamente para deixar claro
-- o que sai e para o caso de FKs terem sido criadas sem cascade em algum run.

delete from public.reajustes
  where contrato_id in (
    select id from public.contratos
    -- where org_id = :'org_alvo'
  );

delete from public.documentos
  where contrato_id in (
    select id from public.contratos
    -- where org_id = :'org_alvo'
  );

delete from public.anotacoes
  where contrato_id in (
    select id from public.contratos
    -- where org_id = :'org_alvo'
  );

delete from public.contratos;
  -- where org_id = :'org_alvo';

commit;

-- Nota: os arquivos no Storage bucket "documentos" NÃO são apagados por SQL.
-- Se quiser zerar os PDFs de teste também, faça pelo Dashboard →
-- Storage → documentos, ou por script com a service-role key.
