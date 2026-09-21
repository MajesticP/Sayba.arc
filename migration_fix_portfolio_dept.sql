-- ============================================================
-- Fix: portfolio.dept should support all departments dynamically
-- (not just hardcoded 'arcgis' / 'it')
-- ============================================================

-- 1. Drop the old rigid CHECK constraint
ALTER TABLE portfolio DROP CONSTRAINT IF EXISTS portfolio_dept_check;

-- 2. Make sure every dept value currently used in portfolio
--    actually exists in layanan_depts (safety net before adding FK).
--    Run this SELECT first to check for orphans:
--    SELECT DISTINCT dept FROM portfolio
--    WHERE dept NOT IN (SELECT value FROM layanan_depts);

-- 3. Add a proper foreign key instead of a hardcoded CHECK.
--    Now ANY department added to layanan_depts automatically
--    becomes a valid portfolio.dept value — no more migrations needed.
ALTER TABLE portfolio
  ADD CONSTRAINT portfolio_dept_fkey
  FOREIGN KEY (dept) REFERENCES layanan_depts(value)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- 4. (Optional) If you'd rather keep it simple with no FK relationship
--    and just want the existing departments allowed, use this instead
--    of step 3 — but you'll need to re-run this every time you add a dept:
--
-- ALTER TABLE portfolio
--   ADD CONSTRAINT portfolio_dept_check
--   CHECK (dept = ANY (ARRAY['arcgis'::text, 'it'::text, 'kelautan'::text, 'softwarejailbreak'::text]));

-- 5. If "Drafter" should be a real department, add it to layanan_depts:
-- INSERT INTO layanan_depts (value, label, description, badge_class, color, sub_categories, sort_order)
-- VALUES ('drafter', 'Drafter', 'Departemen Drafting & Desain Teknik',
--         'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20', '#34d399',
--         ARRAY['2D Drafting','3D Modeling','Shop Drawing'], 4)
-- ON CONFLICT (value) DO NOTHING;
