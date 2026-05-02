// Server-only module — never import this in client components or pages.
// The service role key bypasses RLS; keep it exclusively on the server.
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Lazy singleton — created on first call so the module can be imported
// during Next.js build without throwing when env vars aren't set yet.
let _client: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (_client) return _client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    )
  }

  _client = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  return _client
}

// Convenience proxy so existing imports of `supabaseAdmin` keep working
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabaseAdmin() as any)[prop]
  },
})
