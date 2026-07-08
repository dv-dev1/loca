# Ligar a extração automática de contratos (IA · Ollama Cloud)

Leva ~2 minutos. Depois disso, ao cadastrar um novo contrato você pode soltar o PDF assinado e o formulário se preenche sozinho.

A extração usa o **Ollama Cloud** (endpoint compatível com a API da OpenAI). O texto do PDF é extraído localmente e enviado ao modelo — funciona bem com PDFs "digitais" (com camada de texto). PDFs escaneados/imagem não têm texto legível e continuam no preenchimento manual.

## 1. Pegar a chave

1. Acesse https://ollama.com → entre/cadastre-se.
2. **Settings → Keys → Create key** → copie o valor.

## 2. Colar no projeto

Abra `.env.local` e adicione:
```
OLLAMA_API_KEY=...
```

Opcionais — trocar o modelo (padrão: `gpt-oss:120b`) ou o endpoint (padrão: `https://ollama.com/v1`):
```
OLLAMA_MODEL=gpt-oss:120b
OLLAMA_BASE_URL=https://ollama.com/v1
```

Alguns modelos bons para esta extração, do mais equilibrado ao mais preciso:
`gpt-oss:120b` (recomendado) · `qwen3.5:397b` (máxima precisão) · `gemini-3-flash-preview` (mais rápido/barato).

## 3. Rodar

```
npm run dev
```

Pronto: em **Novo contrato**, uma área para soltar o PDF aparece acima do formulário. Os campos que a IA identificar são preenchidos automaticamente; o resto continua para preenchimento manual, como sempre.

---
Enquanto `OLLAMA_API_KEY` estiver vazia, a área de extração automática fica escondida e o cadastro de contratos continua 100% manual — nada quebra.
