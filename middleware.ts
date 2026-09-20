import { NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddleware } from "./lib/supabase-server"

const isDev = process.env.NODE_ENV === "development"

// ── Rate limiter (in-memory) ────────────────────────────────────────────────
// Works on single-instance (VPS / container). For multi-instance / serverless
// (Vercel Edge), swap the Map for Redis/Upstash.
// Limits state-changing admin API calls per client IP to stop automated abuse;
// the generous cap keeps a human editing many records comfortable.
const MUTATION_LIMIT = 100            // max POST/PUT/DELETE per window
const WINDOW_MS = 5 * 60 * 1000       // 5-minute sliding window

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

/** Increment the counter for ip; returns retryAfterSec (>0) when the limit is hit. */
function hitRateLimit(ip: string): number {
  const now = Date.now()
  let bucket = buckets.get(ip)

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS }
    buckets.set(ip, bucket)
  }
  bucket.count += 1

  if (bucket.count > MUTATION_LIMIT) {
    return Math.ceil((bucket.resetAt - now) / 1000)
  }
  return 0
}

// ── CSP builder ───────────────────────────────────────────────────────────
function buildCsp(nonce: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""

  const directives: string[] = [
    "default-src 'self'",
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    // 'unsafe-inline' is required as fallback for Next.js inline scripts in production.
    // The nonce is still sent for browsers that support it; unsafe-inline is ignored
    // by nonce-capable browsers, so security is not degraded.
    `script-src 'self' 'unsafe-inline' 'nonce-${nonce}' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
    // supabaseUrl covers Supabase Storage image URLs (portfolio image_url field)
    // /api/gdrive-img proxy serves Drive images as same-origin — no external img-src needed beyond lh3
    `img-src 'self' data: ${supabaseUrl}/storage/v1/object/public/ https://lh3.googleusercontent.com https://drive.google.com https://storage.googleapis.com`,
    `connect-src 'self' ${supabaseUrl} https://docs.google.com https://va.vercel-scripts.com`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Additional security headers
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ]

  return directives.join("; ")
}

// ── Middleware ────────────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64")
  const csp = buildCsp(nonce)

  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/api/")
  const isLoginPage = pathname === "/admin/login"
  const isApiRoute = pathname.startsWith("/api/admin/")

  const res = NextResponse.next({
    request: { headers: new Headers({ ...Object.fromEntries(req.headers), "x-nonce": nonce }) },
  })
  res.headers.set("Content-Security-Policy", csp)
  // Security headers
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

  // Admin API routes: rate-limit mutations; auth is enforced per-route by
  // requireAdmin() which returns proper 401 JSON (a redirect here would break
  // the client's fetch()).
  if (isApiRoute) {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const retryAfterSec = hitRateLimit(getClientIp(req))
      if (retryAfterSec > 0) {
        return NextResponse.json(
          { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
          { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
        )
      }
    }
    return res
  }

  if (!isAdminPage) return res

  // Admin pages: session check + redirect guards
  const supabase = createSupabaseMiddleware(req, res)

  // getSession() reads the JWT from the cookie — no network request to Supabase,
  // so it never triggers the auth rate limit. Sufficient for route-guard redirects.
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }

  if (!isLoginPage && !user) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  return res
}

export const config = {
  matcher: [
    // All public routes — CSP + security headers
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)",
    // Admin API routes — session guard + mutation rate limiting
    "/api/admin/:path*",
  ],
}