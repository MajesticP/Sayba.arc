import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

// GET /api/admin/portfolio
export async function GET() {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const { data, error } = await supabaseAdmin
    .from("portfolio")
    .select("id, title, slug, category, dept, description, image_url, result_url, features, tech_stack, status, og_image, created_at")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/portfolio — validate input
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const raw = await req.json()
  const allowed = ["title", "slug", "category", "dept", "description", "image_url", "result_url", "features", "tech_stack", "status", "meta_title", "meta_description", "meta_keywords", "og_image", "canonical_url"]
  const payload: Record<string, unknown> = {}
  for (const k of allowed) if (raw[k] !== undefined) payload[k] = raw[k]

  if (!payload.title || !payload.slug) return NextResponse.json({ error: "title & slug required" }, { status: 400 })
  if (!payload.dept) return NextResponse.json({ error: "dept required" }, { status: 400 })

  const { data, error } = await db.from("portfolio").insert(payload).select().maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Insert did not return a record" }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/admin/portfolio?id=<uuid> — validate input
export async function PUT(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const raw = await req.json()
  const allowed = ["title", "slug", "category", "dept", "description", "image_url", "result_url", "features", "tech_stack", "status", "meta_title", "meta_description", "meta_keywords", "og_image", "canonical_url"]
  const payload: Record<string, unknown> = {}
  for (const k of allowed) if (raw[k] !== undefined) payload[k] = raw[k]

  if (!payload.title || !payload.slug) return NextResponse.json({ error: "title & slug required" }, { status: 400 })
  if (!payload.dept) return NextResponse.json({ error: "dept required" }, { status: 400 })

  const { data, error } = await db.from("portfolio").update(payload).eq("id", id).select().maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Record not found or no changes made" }, { status: 404 })
  return NextResponse.json(data)
}

// DELETE /api/admin/portfolio?id=<uuid>
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { error } = await supabaseAdmin.from("portfolio").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
