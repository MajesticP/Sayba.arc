import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// GET /api/admin/tim
export async function GET() {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const { data, error } = await supabaseAdmin
    .from("tim")
    .select("*")
    .order("order_num", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/tim
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = await req.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any).from("tim").insert(payload).select().maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Insert did not return a record" }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/admin/tim?id=<uuid>
export async function PUT(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const payload = await req.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any).from("tim").update(payload).eq("id", id).select().maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Record not found or no changes made" }, { status: 404 })
  return NextResponse.json(data)
}

// DELETE /api/admin/tim?id=<uuid>
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any).from("tim").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
