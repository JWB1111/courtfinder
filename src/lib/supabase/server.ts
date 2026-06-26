import { createClient } from '@supabase/supabase-js'

// Server-side client – uses service role key for admin operations (never expose to client)
// TODO: switch to @supabase/ssr for cookie-based auth when user accounts are added
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}
