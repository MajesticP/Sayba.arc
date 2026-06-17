-- ============================================================
-- SAYBA ARC — Add bilingual fields to layanan and portfolio
--
-- Adds title_en + description_en to both tables so the
-- dashboard can manage English content alongside Indonesian.
--
-- Existing rows: EN fields default to NULL — fill them in the
-- dashboard, or they fall back to the ID version on the frontend.
--
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

-- layanan
alter table layanan
  add column if not exists title_en       text,
  add column if not exists description_en text;

-- portfolio
alter table portfolio
  add column if not exists title_en       text,
  add column if not exists description_en text;

-- Optional: backfill EN from ID as starting point
-- (comment out if you'd rather fill manually)
-- update layanan   set title_en = title,       description_en = description       where title_en is null;
-- update portfolio set title_en = title,       description_en = description       where title_en is null;
