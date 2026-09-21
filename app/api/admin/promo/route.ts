import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// Supabase JS v2.104+ requires PostgrestVersion in Database type for full
// type inference on write operations. Until the schema is regenerated via
// the Supabase CLI, we cast the client to bypass the generic constraint.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

// GET /api/admin/promo
export async function GET() {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const { data, error } = await supabaseAdmin
    .from("promo_banner")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/promo
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const payload = await req.json()

  const { data, error } = await db.from("promo_banner").insert(payload).select().maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Insert did not return a record" }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/admin/promo?id=<uuid>
export async function PUT(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const payload = await req.json()

  const { data, error } = await db.from("promo_banner").update(payload).eq("id", id).select().maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Record not found or no changes made" }, { status: 404 })
  return NextResponse.json(data)
}

// DELETE /api/admin/promo?id=<uuid>
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { error } = await supabaseAdmin.from("promo_banner").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
