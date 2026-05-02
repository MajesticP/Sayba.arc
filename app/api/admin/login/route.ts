import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

// ── In-memory rate limiter ────────────────────────────────────────────────
// Works correctly on single-instance deployments (VPS / container).
// For multi-instance / serverless (Vercel Edge), swap the Map for a Redis
// or Upstash store using the same interface.
const MAX_ATTEMPTS = 10
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  let bucket = buckets.get(ip)

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + LOCKOUT_MS }
    buckets.set(ip, bucket)
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  return { allowed: true, retryAfterSec: 0 }
}

function recordFailure(ip: string) {
  const now = Date.now()
  let bucket = buckets.get(ip)
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + LOCKOUT_MS }
  }
  bucket.count += 1
  buckets.set(ip, bucket)
}

function clearBucket(ip: string) {
  buckets.delete(ip)
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed, retryAfterSec } = checkRateLimit(ip)

  if (!allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(retryAfterSec / 60)} menit.` },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    )
  }

  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 })
  }

  // Build a response so Supabase can set its auth cookies
  const res = NextResponse.json({ ok: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

  if (authError) {
    recordFailure(ip)
    // Return a generic message — don't leak whether the email exists
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 })
  }

  clearBucket(ip)
  return res
}
