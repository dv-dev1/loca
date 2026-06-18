-- ============================================================
-- Locá — seed de exemplo (rode DEPOIS do schema.sql)
-- ============================================================

insert into public.contratos
  (ref, tipo, imovel, endereco, matricula, iptu, locador, locador_doc, locatario, locatario_doc, aluguel, indice, vencimento_dia, inicio, fim, garantia)
values
  ('LOC-0388','Residencial','Casa · R. das Acácias, 120','R. das Acácias, 120 — Jardim Sul','44.812','012.345.0001-7','Antônio Prado','123.456.789-00','Família Ribeiro','987.654.321-00',3100,'IGP-M',5,'2024-06-01','2026-06-01','Fiador'),
  ('LOC-0429','Residencial','Apto 302 · Ed. Aurora','Av. Beira-Rio, 880, ap. 302 — Centro','51.227','045.118.0302-3','Helena Castro','111.222.333-44','Marina Lopes','555.666.777-88',2498,'IGP-M',10,'2025-01-01','2027-01-01','Caução'),
  ('LOC-0411','Comercial','Sala 14 · Empresarial Norte','R. do Comércio, 45, sala 14 — Norte','38.904','077.220.0014-9','Invest Norte Ltda.','12.345.678/0001-90','Contábil Vega ME','98.765.432/0001-10',5387,'IPCA',8,'2023-07-01','2027-07-01','Seguro-fiança'),
  ('LOC-0356','Comercial','Loja 3 · Galeria Sul','Galeria Sul, loja 3 — Centro','29.551','033.901.0003-1','Galeria Sul S.A.','11.222.333/0001-44','Ótica Mirante','22.333.444/0001-55',9265,'IGP-M',5,'2024-02-01','2027-02-01','Fiador'),
  ('LOC-0341','Residencial','Apto 71 · Ed. Cedro','R. dos Pinhais, 200, ap. 71 — Leste','60.103','088.440.0071-2','Marcos Vasquez','222.333.444-55','Bruno e Carla Tavares','333.444.555-66',2050,'IPCA',15,'2024-08-01','2026-08-01','Caução'),
  ('LOC-0298','Comercial','Conj. 9 · Torre Marília','Av. das Torres, 1500, conj. 9 — Norte','55.018','099.330.0009-4','Torre Marília Empr.','33.444.555/0001-66','Estúdio Norte Arq.','44.555.666/0001-77',6700,'IPCA',7,'2023-09-01','2027-09-01','Fiador')
on conflict (ref) do nothing;
