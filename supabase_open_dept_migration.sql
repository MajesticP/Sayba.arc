-- ============================================================
-- SAYBA ARC — Make `dept` fully open across layanan, portfolio, tim
--
-- lib/layanan-config.ts already documents dept as an "open string
-- driven by LAYANAN_DEPTS config" and says adding a new department
-- is just "add an entry to LAYANAN_DEPTS — dashboard, filters,
-- badges, forms all update automatically."
--
-- But the schema still had hardcoded CHECK constraints that
-- contradict that promise:
--
--   - layanan.dept   only allowed ('arcgis','it','kelautan')
--   - portfolio.dept only allowed ('arcgis','it')   -- didn't even allow 'kelautan'
--   - tim.dept       only allowed ('lingkungan','it','kelautan')
--
-- Result: the 4th dept already defined in LAYANAN_DEPTS
-- ("softwarejailbreak") would be REJECTED if you tried to add a
-- service under it, and portfolio items couldn't be tagged
-- 'kelautan' at all. This migration drops those constraints so
-- `dept` is validated at the app layer (LAYANAN_DEPTS) instead —
-- add a new dept in code, no DB migration needed going forward.
--
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

alter table layanan   drop constraint if exists layanan_dept_check;
alter table portfolio drop constraint if exists portfolio_dept_check;
alter table tim       drop constraint if exists tim_dept_check;

alter table layanan   alter column dept set not null;
alter table portfolio alter column dept set not null;

-- NOTE: tim.dept currently uses 'lingkungan' for the environmental/GIS
-- team, while layanan/portfolio use 'arcgis' for the same department —
-- these should be aligned to the same LAYANAN_DEPTS values once dept
-- naming is finalized. Once decided, run:
--
--   update tim set dept = 'arcgis' where dept = 'lingkungan';
