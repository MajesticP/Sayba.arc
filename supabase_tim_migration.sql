-- Run this in the Supabase SQL Editor to create the tim (team) table

create table if not exists public.tim (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null,
  bio         text,
  photo_url   text,          -- Google Drive link (will be auto-converted in UI)
  order_num   integer not null default 0,
  status      text not null default 'active' check (status in ('active', 'draft')),
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.tim enable row level security;

-- Allow public read of active members
create policy "Public can view active tim"
  on public.tim for select
  using (status = 'active');

-- Admin full access (service role bypasses RLS automatically)
-- No extra policy needed for admin writes via service role key

-- Optional: seed initial data
-- SAYBA ARC punya dua departemen: IT Consultant dan Engineering Consultant.
insert into public.tim (name, role, bio, order_num) values
  ('Tim IT Consultant', 'Perangkat Lunak & Sistem Informasi',
   'Membangun aplikasi web dan mobile, backend dan API, basis data, machine learning, serta sistem informasi — dari perancangan sampai pemeliharaan. Stack utama: Next.js, TypeScript, Python, PostgreSQL.', 1),
  ('Tim Engineering Consultant', 'Pemetaan Spasial & Rancang Bangun',
   'Mengerjakan pemetaan GIS, penginderaan jauh, analisis spasial, gambar teknik CAD, dan dokumen rancang bangun untuk kebutuhan perizinan, konstruksi, dan tata ruang.', 2);
