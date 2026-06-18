# Ligar o Supabase (login real + dados persistidos)

Leva ~5 minutos. Depois disso o login funciona de verdade e a carteira passa a ler/gravar no banco.

## 1. Criar o projeto
1. Acesse https://supabase.com → entre/cadastre-se (plano free serve).
2. **New project** → dê um nome (ex.: `loca`), escolha uma senha de banco e a região mais perto (South America).
3. Espere ~2 min provisionar.

## 2. Criar as tabelas
1. No projeto: **SQL Editor → New query**.
2. Cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e **Run**.
3. (Opcional) Cole [`supabase/seed.sql`](supabase/seed.sql) e **Run** para já ter a carteira de exemplo.

## 3. Pegar as chaves
Em **Project Settings → API**, copie:
- **Project URL**
- **anon public** key
- **service_role** key (fica só no servidor)

## 4. Colar no projeto
Abra `.env.local` e preencha:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 5. Criar um usuário de login
Em **Authentication → Users → Add user** (email + senha). Esse será seu login.
> Dica: em **Authentication → Providers → Email**, deixe "Confirm email" desligado no começo pra agilizar.

## 6. Rodar
```
npm run build && npx next start -p 3200
```
Pronto: `/login` passa a autenticar de verdade e as rotas internas exigem sessão.

---
Enquanto o `.env.local` estiver vazio, o app continua no **modo demo** (login leva direto ao painel, dados mockados) — nada quebra.
