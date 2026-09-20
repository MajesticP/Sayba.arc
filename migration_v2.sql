-- ============================================================
-- SAYBA ARC — Migration V2
-- 1. Create table 'informasi' (mirrors berita but for services)
-- 2. Drop table 'produk'
-- 3. Update 'layanan_depts' to IT Konsulting & Engineering Konsulting
-- ============================================================

-- 1. Create table 'informasi'
create table if not exists informasi (
  id            uuid        default gen_random_uuid() primary key,
  title         text        not null,
  slug          text        unique not null,
  excerpt       text,
  category      text        not null default 'umum',
  image_url     text,
  author        text        not null default 'Tim SAYBA ARC',
  body          text,
  published_at  date        not null default current_date,
  read_minutes  integer     not null default 3,
  views         integer     not null default 0,
  featured      boolean     not null default false,
  tags          text[],
  status        text        not null default 'active' check (status in ('active', 'draft', 'archived')),
  meta_title        text,
  meta_description  text,
  meta_keywords     text[],
  og_image          text,
  canonical_url     text,
  created_at    timestamptz default now()
);

create index if not exists informasi_published_at_idx on informasi (published_at desc);
create index if not exists informasi_status_idx       on informasi (status);
alter table informasi enable row level security;

create policy "informasi_public_read" on informasi for select using (true);
create policy "informasi_auth_write" on informasi for insert with check (auth.role() = 'authenticated');
create policy "informasi_auth_update" on informasi for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "informasi_auth_delete" on informasi for delete using (auth.role() = 'authenticated');

-- 2. Drop table produk
drop table if exists produk cascade;

-- 3. Update layanan_depts and related constraints
-- Relax constraints to allow migration
alter table layanan drop constraint if exists layanan_dept_check;
alter table portfolio drop constraint if exists portfolio_dept_check;

-- Update existing data mapping
update layanan set dept = 'it_konsulting' where dept in ('it', 'softwarejailbreak');
update layanan set dept = 'engineering_konsulting' where dept in ('arcgis', 'kelautan');
update portfolio set dept = 'it_konsulting' where dept in ('it', 'softwarejailbreak');
update portfolio set dept = 'engineering_konsulting' where dept in ('arcgis', 'kelautan');

-- Apply new constraints
alter table layanan add constraint layanan_dept_check check (dept in ('it_konsulting', 'engineering_konsulting'));
alter table portfolio add constraint portfolio_dept_check check (dept in ('it_konsulting', 'engineering_konsulting'));

-- Delete old depts
delete from layanan_depts;

-- Insert new depts
insert into layanan_depts (value, label, description, badge_class, color, sub_categories, sort_order) values
('it_konsulting', 'IT Konsulting', 'Departemen Teknologi Informasi & Digital', 'bg-blue-400/10 text-blue-400 ring-blue-400/20', '#60a5fa', ARRAY['Web Development', 'Mobile Application', 'System Integration', 'Machine Learning', 'Data Analytics'], 0),
('engineering_konsulting', 'Engineering Konsulting', 'Departemen Rekayasa & Rancang Teknik', 'bg-[#0a6e8a]/10 text-[#0a6e8a] ring-[#0a6e8a]/20', '#0a6e8a', ARRAY['GIS & Pemetaan', 'IoT Development', 'Firmware Engineering', 'Perencanaan Teknis'], 1);
