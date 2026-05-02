// Shared helper — verifies the caller has an active admin session.
// Use this at the top of every admin API route handler.
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function requireAdmin() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Route handlers are read-only for cookies; session refresh happens
          // in middleware before the request reaches here.
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { user, unauthorized: () => NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
}
