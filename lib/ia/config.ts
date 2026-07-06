// Diferente de `supabaseConfigured` (lib/supabase/client.ts), que lê uma chave
// pública NEXT_PUBLIC_*, OPENAI_API_KEY é secreta e não tem equivalente público —
// só pode ser lida em código server-side. Páginas server component importam este
// booleano e o repassam como prop para componentes client, a chave em si nunca
// chega ao bundle do client.
export const openaiConfigured = !!process.env.OPENAI_API_KEY;
