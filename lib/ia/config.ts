// Diferente de `supabaseConfigured` (lib/supabase/client.ts), que lê uma chave
// pública NEXT_PUBLIC_*, OLLAMA_API_KEY é secreta e não tem equivalente público —
// só pode ser lida em código server-side. Páginas server component importam este
// booleano e o repassam como prop para componentes client; a chave em si nunca
// chega ao bundle do client.
//
// O nome do export segue `openaiConfigured` porque a extração usa o SDK da OpenAI
// apontado para o endpoint compatível do Ollama Cloud — manter o nome evita mexer
// nos componentes de UI que já consomem esta prop.
export const openaiConfigured = !!process.env.OLLAMA_API_KEY;
