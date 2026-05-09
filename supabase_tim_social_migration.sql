-- Migration: Add social links + dept field to the tim table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.tim
  ADD COLUMN IF NOT EXISTS github_url    text,
  ADD COLUMN IF NOT EXISTS linkedin_url  text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS dept          text CHECK (dept IN ('lingkungan', 'it', 'kelautan'));

-- Update existing seed rows to assign their dept
UPDATE public.tim SET dept = 'lingkungan' WHERE name = 'Tim Teknik Lingkungan';
UPDATE public.tim SET dept = 'it'         WHERE name = 'Tim IT & Digital';
UPDATE public.tim SET dept = 'kelautan'   WHERE name = 'Tim Teknik Kelautan';
