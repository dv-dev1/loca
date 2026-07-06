# Ligar a extração automática de contratos (IA)

Leva ~2 minutos. Depois disso, ao cadastrar um novo contrato você pode soltar o PDF assinado e o formulário se preenche sozinho.

## 1. Pegar a chave

1. Acesse https://platform.openai.com/api-keys → entre/cadastre-se.
2. **Create new secret key** → copie o valor (só é exibido uma vez).

## 2. Colar no projeto

Abra `.env.local` e adicione:
```
OPENAI_API_KEY=...
```

Opcional — trocar o modelo usado na extração (padrão: `gpt-4o`):
```
OPENAI_MODEL=...
```

## 3. Rodar

```
npm run dev
```

Pronto: em **Novo contrato**, uma área para soltar o PDF aparece acima do formulário. Os campos que a IA identificar são preenchidos automaticamente; o resto continua para preenchimento manual, como sempre.

---
Enquanto `OPENAI_API_KEY` estiver vazia, a área de extração automática fica escondida e o cadastro de contratos continua 100% manual — nada quebra.
