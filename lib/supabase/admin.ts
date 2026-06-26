import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a service-role key. APENAS server-side (server actions /
 * route handlers): ignora RLS. Nunca importe isto em código de cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
