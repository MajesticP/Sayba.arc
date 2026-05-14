import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

// Default seed data — mirrors layanan-config.ts
const DEFAULT_SEED = [
  { value: "arcgis", label: "ArcGIS", description: "Departemen Teknik Lingkungan & Pemetaan", badge_class: "bg-[#ff914d]/10 text-[#ff914d] ring-[#ff914d]/20", color: "#ff914d", sub_categories: ["Web GIS","Desktop GIS","3D Mapping","Spatial Analysis","Training & Workshop","Data Processing"], sort_order: 0 },
  { value: "it", label: "IT", description: "Departemen Teknologi Informasi & Digital", badge_class: "bg-blue-400/10 text-blue-400 ring-blue-400/20", color: "#60a5fa", sub_categories: ["Web Development","Mobile App","Backend & API","UI/UX Design","Cloud & DevOps","Cybersecurity"], sort_order: 1 },
  { value: "kelautan", label: "Kelautan", description: "Departemen Teknik Kelautan & Perkapalan", badge_class: "bg-[#0a6e8a]/10 text-[#0a6e8a] ring-[#0a6e8a]/20", color: "#0a6e8a", sub_categories: ["Desain Kapal","Analisis Hidrodinamika","Survey Batimetri","Manajemen Pelabuhan","Konsultasi Kelautan"], sort_order: 2 },
  { value: "softwarejailbreak", label: "Software Jailbreak", description: "Departemen Software & Jailbreak", badge_class: "bg-purple-400/10 text-purple-400 ring-purple-400/20", color: "#a78bfa", sub_categories: ["Oprek HP","Custom ROM","Unlock Bootloader","Firmware Flash"], sort_order: 3 },
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
    .select("*")
    .order("sort_order", { ascending: true })

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
