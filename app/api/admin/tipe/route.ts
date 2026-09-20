import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

// Default seed data — mirrors layanan-config.ts
const DEFAULT_SEED = [
  { value: "it_konsulting", label: "IT Konsulting", description: "Departemen Teknologi Informasi & Digital", badge_class: "bg-blue-400/10 text-blue-400 ring-blue-400/20", color: "#60a5fa", sub_categories: ["Web Development","Mobile Application","System Integration","Machine Learning","Data Analytics"], sort_order: 0 },
  { value: "engineering_konsulting", label: "Engineering Konsulting", description: "Departemen Rekayasa & Rancang Teknik", badge_class: "bg-[#0a6e8a]/10 text-[#0a6e8a] ring-[#0a6e8a]/20", color: "#0a6e8a", sub_categories: ["GIS & Pemetaan","IoT Development","Firmware Engineering","Perencanaan Teknis"], sort_order: 1 },
]

function toClient(row: any) {
  return { value: row.value, label: row.label, description: row.description ?? "", badgeClass: row.badge_class, color: row.color, subCategories: row.sub_categories ?? [] }
}

// GET /api/admin/tipe
export async function GET() {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const { data, error } = await supabaseAdmin
      .from("layanan_depts")
      .select("value, label, description, badge_class, color, sub_categories, sort_order")
      .order("sort_order", { ascending: true })
      .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-seed if table is empty
  if (!data || data.length === 0) {
    const { data: seeded, error: seedErr } = await (db as any)
      .from("layanan_depts")
      .insert(DEFAULT_SEED)
      .select()
    if (seedErr) return NextResponse.json({ error: seedErr.message }, { status: 500 })
    return NextResponse.json((seeded ?? []).map(toClient))
  }

  return NextResponse.json(data.map(toClient))
}

// POST /api/admin/tipe — validate input
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const body = await req.json()
  if (!body.value || !body.label) return NextResponse.json({ error: "value & label required" }, { status: 400 })
  // value becomes a filter key & slug-ish identifier — restrict to safe charset
  if (!/^[a-z0-9_-]{1,40}$/.test(String(body.value))) return NextResponse.json({ error: "value must be lowercase letters/digits/_/-" }, { status: 400 })
  if (!Array.isArray(body.subCategories)) return NextResponse.json({ error: "subCategories must be an array" }, { status: 400 })

  const { data, error } = await db.from("layanan_depts").insert({
    value: String(body.value),
    label: String(body.label),
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
  const { error } = await db.from("layanan_depts").update({
    label: body.label,
    description: body.description ?? null,
    badge_class: body.badgeClass,
    color: body.color,
    sub_categories: body.subCategories ?? [],
  }).eq("value", value)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
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
