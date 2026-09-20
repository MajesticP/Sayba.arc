-- ============================================================
-- SAYBA ARC — FULL SUPABASE RESET & SETUP
-- Copy seluruh teks ini dan jalankan di SQL Editor Supabase
-- WARNING: Ini akan mereset database ke kondisi awal (bersih)
-- ============================================================

-- 1. DROP SEMUA TABEL (Pembersihan Total)
drop table if exists informasi cascade;
drop table if exists produk cascade; -- jaga-jaga jika masih ada
drop table if exists berita cascade;
drop table if exists portfolio cascade;
drop table if exists layanan cascade;
drop table if exists promo_banner cascade;
drop table if exists tim cascade;
drop table if exists layanan_depts cascade;

-- 2. TABEL DEPARTEMEN LAYANAN (Kategori Utama)
create table layanan_depts (
  value           text primary key,
  label           text not null,
  description     text,
  badge_class     text,
  color           text,
  sub_categories  text[] default '{}',
  sort_order      integer default 0
);
alter table layanan_depts enable row level security;
create policy "layanan_depts_public_read" on layanan_depts for select using (true);

-- Isi Data Default untuk 2 Kategori Layanan
insert into layanan_depts (value, label, description, badge_class, color, sub_categories, sort_order) values
('it_konsulting', 'IT Konsulting', 'Departemen Teknologi Informasi & Digital', 'bg-blue-400/10 text-blue-400 ring-blue-400/20', '#60a5fa', ARRAY['Web Development', 'Mobile Application', 'System Integration', 'Machine Learning', 'Data Analytics'], 0),
('engineering_konsulting', 'Engineering Konsulting', 'Departemen Rekayasa & Rancang Teknik', 'bg-[#0a6e8a]/10 text-[#0a6e8a] ring-[#0a6e8a]/20', '#0a6e8a', ARRAY['GIS & Pemetaan', 'IoT Development', 'Firmware Engineering', 'Perencanaan Teknis'], 1);

-- 3. TABEL LAYANAN
create table layanan (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  slug            text unique not null,
  dept            text not null references layanan_depts(value) on delete cascade,
  category        text,
  description     text,
  icon            text default 'map',
  image_url       text,
  prices          jsonb,
  status          text not null default 'active' check (status in ('active', 'draft', 'archived')),
  featured_order  integer,
  meta_title      text,
  meta_description text,
  meta_keywords   text[],
  og_image        text,
  canonical_url   text,
  created_at      timestamptz default now()
);
alter table layanan enable row level security;
create policy "layanan_public_read" on layanan for select using (true);
create policy "layanan_auth_write" on layanan for insert with check (auth.role() = 'authenticated');
create policy "layanan_auth_update" on layanan for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "layanan_auth_delete" on layanan for delete using (auth.role() = 'authenticated');

-- 4. TABEL PORTFOLIO
create table portfolio (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  slug            text unique not null,
  category        text,
  dept            text not null references layanan_depts(value) on delete cascade,
  description     text,
  image_url       text,
  result_url      text,
  features        text[],
  tech_stack      text[],
  status          text not null default 'active' check (status in ('active', 'draft', 'archived')),
  meta_title      text,
  meta_description text,
  meta_keywords   text[],
  og_image        text,
  canonical_url   text,
  created_at      timestamptz default now()
);
alter table portfolio enable row level security;
create policy "portfolio_public_read" on portfolio for select using (true);
create policy "portfolio_auth_write" on portfolio for insert with check (auth.role() = 'authenticated');
create policy "portfolio_auth_update" on portfolio for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "portfolio_auth_delete" on portfolio for delete using (auth.role() = 'authenticated');

-- 5. TABEL INFORMASI (Pengganti Produk)
create table informasi (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  slug            text unique not null,
  excerpt         text,
  category        text not null default 'umum',
  image_url       text,
  author          text not null default 'Tim SAYBA ARC',
  body            text,
  published_at    date not null default current_date,
  read_minutes    integer not null default 3,
  views           integer not null default 0,
  featured        boolean not null default false,
  tags            text[],
  status          text not null default 'active' check (status in ('active', 'draft', 'archived')),
  meta_title      text,
  meta_description text,
  meta_keywords   text[],
  og_image        text,
  canonical_url   text,
  created_at      timestamptz default now()
);
create index informasi_published_at_idx on informasi (published_at desc);
create index informasi_status_idx on informasi (status);
alter table informasi enable row level security;
create policy "informasi_public_read" on informasi for select using (true);
create policy "informasi_auth_write" on informasi for insert with check (auth.role() = 'authenticated');
create policy "informasi_auth_update" on informasi for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "informasi_auth_delete" on informasi for delete using (auth.role() = 'authenticated');

-- 6. TABEL BERITA
create table berita (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  slug            text unique not null,
  excerpt         text,
  category        text not null default 'umum',
  image_url       text,
  author          text not null default 'Tim SAYBA ARC',
  body            text,
  published_at    date not null default current_date,
  read_minutes    integer not null default 3,
  views           integer not null default 0,
  featured        boolean not null default false,
  tags            text[],
  status          text not null default 'active' check (status in ('active', 'draft', 'archived')),
  meta_title      text,
  meta_description text,
  meta_keywords   text[],
  og_image        text,
  canonical_url   text,
  created_at      timestamptz default now()
);
create index berita_published_at_idx on berita (published_at desc);
create index berita_status_idx on berita (status);
alter table berita enable row level security;
create policy "berita_public_read" on berita for select using (true);
create policy "berita_auth_write" on berita for insert with check (auth.role() = 'authenticated');
create policy "berita_auth_update" on berita for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "berita_auth_delete" on berita for delete using (auth.role() = 'authenticated');

-- 7. TABEL PROMO BANNER
create table promo_banner (
  id              uuid default gen_random_uuid() primary key,
  image_url       text not null,
  alt             text not null,
  eyebrow         text,
  title           text,
  subtitle        text,
  cta_text        text,
  cta_href        text,
  sort_order      integer not null default 0,
  status          text not null default 'active' check (status in ('active', 'draft')),
  created_at      timestamptz default now()
);
alter table promo_banner enable row level security;
create policy "promo_banner_public_read" on promo_banner for select using (status = 'active');
create policy "promo_banner_auth_write" on promo_banner for insert with check (auth.role() = 'authenticated');
create policy "promo_banner_auth_update" on promo_banner for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "promo_banner_auth_delete" on promo_banner for delete using (auth.role() = 'authenticated');

-- 8. TABEL TIM
create table tim (
  id              uuid default gen_random_uuid() primary key,
  name            text not null,
  role            text not null,
  bio             text,
  photo_url       text,
  github_url      text,
  linkedin_url    text,
  instagram_url   text,
  dept            text check (dept in ('lingkungan', 'it', 'kelautan')),
  order_num       integer not null default 0,
  status          text not null default 'active' check (status in ('active', 'draft')),
  created_at      timestamptz default now()
);
alter table tim enable row level security;
create policy "tim_public_read" on tim for select using (status = 'active');
create policy "tim_auth_write" on tim for insert with check (auth.role() = 'authenticated');
create policy "tim_auth_update" on tim for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "tim_auth_delete" on tim for delete using (auth.role() = 'authenticated');
