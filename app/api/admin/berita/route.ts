import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// Supabase JS v2.104+ requires PostgrestVersion in Database type for full
// type inference on write operations. Until the schema is regenerated via
// the Supabase CLI, we cast the client to bypass the generic constraint.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

// GET /api/admin/berita
export async function GET() {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const { data, error } = await supabaseAdmin
    .from("berita")
    .select("id, title, slug, excerpt, category, image_url, author, body, published_at, read_minutes, views, featured, tags, status, meta_title, meta_description, meta_keywords, og_image, canonical_url, created_at")
    .order("published_at", { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/berita — validate input, no raw payload
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const raw = await req.json()
  const allowed = ["title", "slug", "excerpt", "category", "image_url", "author", "body", "published_at", "read_minutes", "views", "featured", "tags", "status", "meta_title", "meta_description", "meta_keywords", "og_image", "canonical_url"]
  const payload: Record<string, unknown> = {}
  for (const k of allowed) if (raw[k] !== undefined) payload[k] = raw[k]

  if (!payload.title || !payload.slug) return NextResponse.json({ error: "title & slug required" }, { status: 400 })

  // Hanya boleh ada satu artikel Sorotan.
  if (payload.featured === true) {
    await db.from("berita").update({ featured: false }).eq("featured", true)
  }

  const { data, error } = await db.from("berita").insert(payload).select().maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Insert did not return a record" }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/admin/berita?id=<uuid> — validate input
export async function PUT(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const raw = await req.json()
  const allowed = ["title", "slug", "excerpt", "category", "image_url", "author", "body", "published_at", "read_minutes", "views", "featured", "tags", "status", "meta_title", "meta_description", "meta_keywords", "og_image", "canonical_url"]
  const payload: Record<string, unknown> = {}
  for (const k of allowed) if (raw[k] !== undefined) payload[k] = raw[k]

  if (!payload.title || !payload.slug) return NextResponse.json({ error: "title & slug required" }, { status: 400 })

  if (payload.featured === true) {
    await db.from("berita").update({ featured: false }).eq("featured", true).neq("id", id)
  }

  const { data, error } = await db.from("berita").update(payload).eq("id", id).select().maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Record not found or no changes made" }, { status: 404 })
  return NextResponse.json(data)
}

// DELETE /api/admin/berita?id=<uuid>
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { error } = await supabaseAdmin.from("berita").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
