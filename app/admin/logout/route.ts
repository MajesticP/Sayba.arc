import { createSupabaseMiddleware } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SITE_URL")
  }

  const res = NextResponse.redirect(new URL("/admin/login", siteUrl))
  const supabase = createSupabaseMiddleware(req, res)
  await supabase.auth.signOut()

  return res
}
