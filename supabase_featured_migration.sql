-- Migration: Add featured_order to layanan
-- Run this in your Supabase SQL editor

ALTER TABLE layanan
  ADD COLUMN IF NOT EXISTS featured_order integer DEFAULT NULL;

-- Optional: enforce only values 1-3 (or null)
ALTER TABLE layanan
  ADD CONSTRAINT layanan_featured_order_check
  CHECK (featured_order IS NULL OR featured_order BETWEEN 1 AND 3);

-- Optional: unique constraint so no two services share the same position
-- (remove if you want to allow duplicates / handle it in the app)
CREATE UNIQUE INDEX IF NOT EXISTS layanan_featured_order_unique
  ON layanan (featured_order)
  WHERE featured_order IS NOT NULL;

-- Verify
SELECT id, title, featured_order FROM layanan ORDER BY featured_order NULLS LAST;

-- Migration: Add image_url to layanan (for Google Drive image support)
-- Run this in your Supabase SQL editor

ALTER TABLE layanan
  ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;

-- Verify
SELECT id, title, image_url FROM layanan ORDER BY created_at DESC LIMIT 5;
