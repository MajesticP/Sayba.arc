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
insert into public.tim (name, role, bio, order_num) values
  ('Tim Teknik Lingkungan', 'Pemetaan ArcGIS & Analisis Spasial',
   'Menangani seluruh pekerjaan pemetaan, GIS, penginderaan jauh, dan analisis data lingkungan. Berpengalaman dalam pengolahan data spasial untuk kebutuhan kajian lingkungan dan tata ruang.', 1),
  ('Tim IT & Digital', 'Web, Mobile, ML & Data Science',
   'Membangun aplikasi web dan mobile modern, model machine learning, sistem analitik data, dan sistem informasi — dari nol hingga deployment. Stack utama: Next.js, Python, React Native.', 2),
  ('Tim Teknik Kelautan', 'Desain & Gambar Teknik Kapal',
   'Mengerjakan seluruh gambar teknik kapal 2D menggunakan AutoCAD — lines plan, general arrangement, konstruksi, outfitting, hingga tata letak akomodasi sesuai standar teknis.', 3);
