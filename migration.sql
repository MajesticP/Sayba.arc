-- Create layanan_depts table
CREATE TABLE IF NOT EXISTS layanan_depts (
  value TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  badge_class TEXT NOT NULL DEFAULT 'bg-white/10 text-white ring-white/20',
  color TEXT NOT NULL DEFAULT '#888888',
  sub_categories TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with defaults (adjust if you already have custom data)
INSERT INTO layanan_depts (value, label, description, badge_class, color, sub_categories, sort_order) VALUES
  ('arcgis',    'ArcGIS',            'Departemen Teknik Lingkungan & Pemetaan',   'bg-[#ff914d]/10 text-[#ff914d] ring-[#ff914d]/20', '#ff914d', ARRAY['Web GIS','Desktop GIS','3D Mapping','Spatial Analysis','Training & Workshop','Data Processing'], 0),
  ('it',        'IT',                'Departemen Teknologi Informasi & Digital',   'bg-blue-400/10 text-blue-400 ring-blue-400/20',     '#60a5fa', ARRAY['Web Development','Mobile App','Backend & API','UI/UX Design','Cloud & DevOps','Cybersecurity'], 1),
  ('kelautan',  'Kelautan',          'Departemen Teknik Kelautan & Perkapalan',    'bg-[#0a6e8a]/10 text-[#0a6e8a] ring-[#0a6e8a]/20', '#0a6e8a', ARRAY['Desain Kapal','Analisis Hidrodinamika','Survey Batimetri','Manajemen Pelabuhan','Konsultasi Kelautan'], 2),
  ('softwarejailbreak', 'Software Jailbreak', 'Departemen Software & Jailbreak',  'bg-purple-400/10 text-purple-400 ring-purple-400/20','#a78bfa', ARRAY['Oprek HP','Custom ROM','Unlock Bootloader','Firmware Flash'], 3)
ON CONFLICT (value) DO NOTHING;

-- RLS: allow service_role (server-side) full access
ALTER TABLE layanan_depts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON layanan_depts FOR ALL TO service_role USING (true) WITH CHECK (true);
