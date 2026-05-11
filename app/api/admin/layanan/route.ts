import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// Supabase JS v2.104+ requires PostgrestVersion in Database type for full
// type inference on write operations. Until the schema is regenerated via
// the Supabase CLI, we cast the client to bypass the generic constraint.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

// GET /api/admin/layanan
export async function GET() {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const { data, error } = await supabaseAdmin
    .from("layanan")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/layanan
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const payload = await req.json()

  // Auto-clear any existing service that already holds this featured_order slot
  if (payload.featured_order !== null && payload.featured_order !== undefined) {
    await db.from("layanan")
      .update({ featured_order: null })
      .eq("featured_order", payload.featured_order)
  }

  const { data, error } = await db.from("layanan").insert(payload).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/admin/layanan?id=<uuid>
export async function PUT(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const payload = await req.json()

  // Auto-clear any OTHER service that already holds this featured_order slot
  if (payload.featured_order !== null && payload.featured_order !== undefined) {
    await db.from("layanan")
      .update({ featured_order: null })
      .eq("featured_order", payload.featured_order)
      .neq("id", id)
  }

  const { data, error } = await db.from("layanan").update(payload).eq("id", id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/admin/layanan?id=<uuid>
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { error } = await supabaseAdmin.from("layanan").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
