import { NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddleware } from "./lib/supabase-server"

const isDev = process.env.NODE_ENV === "development"

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
    `img-src 'self' data: ${supabaseUrl}/storage/v1/object/public/ https://lh3.googleusercontent.com https://drive.google.com https://storage.googleapis.com`,
    `connect-src 'self' ${supabaseUrl} https://docs.google.com https://va.vercel-scripts.com`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]

  return directives.join("; ")
}

// ── Middleware ────────────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64")
  const csp = buildCsp(nonce)

  const isAdminRoute = pathname.startsWith("/admin")
  const isLoginPage = pathname === "/admin/login"

  if (!isAdminRoute) {
    const res = NextResponse.next({
      request: { headers: new Headers({ ...Object.fromEntries(req.headers), "x-nonce": nonce }) },
    })
    res.headers.set("Content-Security-Policy", csp)
    return res
  }

  // Admin routes: session check + CSP
  const res = NextResponse.next({
    request: { headers: new Headers({ ...Object.fromEntries(req.headers), "x-nonce": nonce }) },
  })
  res.headers.set("Content-Security-Policy", csp)

  const supabase = createSupabaseMiddleware(req, res)

  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)",
  ],
}