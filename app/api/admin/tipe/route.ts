import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

// GET /api/admin/tipe
export async function GET() {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const { data, error } = await supabaseAdmin
    .from("layanan_depts")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Map snake_case DB columns → camelCase LayananDept shape
  const mapped = (data ?? []).map((row: any) => ({
    value: row.value,
    label: row.label,
    description: row.description ?? "",
    badgeClass: row.badge_class,
    color: row.color,
    subCategories: row.sub_categories ?? [],
  }))

  return NextResponse.json(mapped)
}

// POST /api/admin/tipe
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const body = await req.json()
  const { data, error } = await db.from("layanan_depts").insert({
    value: body.value,
    label: body.label,
    description: body.description ?? null,
    badge_class: body.badgeClass,
    color: body.color,
    sub_categories: body.subCategories ?? [],
  }).select().maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/admin/tipe?value=<slug>
export async function PUT(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const value = req.nextUrl.searchParams.get("value")
  if (!value) return NextResponse.json({ error: "Missing value" }, { status: 400 })

  const body = await req.json()
  const { data, error } = await db.from("layanan_depts").update({
    label: body.label,
    description: body.description ?? null,
    badge_class: body.badgeClass,
    color: body.color,
    sub_categories: body.subCategories ?? [],
  }).eq("value", value).select().maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(data)
}

// DELETE /api/admin/tipe?value=<slug>
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const value = req.nextUrl.searchParams.get("value")
  if (!value) return NextResponse.json({ error: "Missing value" }, { status: 400 })

  const { error } = await supabaseAdmin.from("layanan_depts").delete().eq("value", value)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
