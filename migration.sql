-- ============================================================
-- SAYBA ARC — Departemen Layanan (layanan_depts)
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Aman dijalankan berulang (idempotent).
--
-- SAYBA ARC punya DUA departemen tetap:
--   1. it_konsulting        — IT Consultant
--   2. engineering_konsulting — Engineering Consultant
--
-- Departemen sengaja dibuat tetap di kode (lib/layanan-config.ts) supaya
-- struktur navigasi tidak berubah-ubah. Yang dikelola lewat admin adalah
-- daftar LAYANAN di dalam tiap departemen.
-- ============================================================

create table if not exists layanan_depts (
  value         text primary key,
  label         text not null,
  description   text,
  color         text not null default '#5e6572',
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

-- Hapus kolom warisan yang sudah tidak dipakai kode (aman bila tidak ada)
alter table layanan_depts drop column if exists badge_class;
alter table layanan_depts drop column if exists sub_categories;

-- Dua departemen tetap
insert into layanan_depts (value, label, description, color, sort_order) values
  ('it_konsulting', 'IT Consultant',
   'Pengembangan perangkat lunak, sistem informasi, dan infrastruktur digital.',
   '#7d98a1', 0),
  ('engineering_konsulting', 'Engineering Consultant',
   'Pemetaan spasial, gambar teknik CAD, dan dokumen rancang bangun.',
   '#c3cdd9', 1)
on conflict (value) do update set
  label       = excluded.label,
  description = excluded.description,
  color       = excluded.color,
  sort_order  = excluded.sort_order;

-- Buang departemen lama yang sudah tidak dipakai (perkapalan/kelautan dll)
delete from layanan_depts
where value not in ('it_konsulting', 'engineering_konsulting');

-- RLS: service_role (server-side) akses penuh
alter table layanan_depts enable row level security;

drop policy if exists "service_role_all" on layanan_depts;
create policy "service_role_all" on layanan_depts
  for all to service_role using (true) with check (true);
