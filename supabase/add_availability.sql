-- ============================================================
-- Add availability column to profiles
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT '';

-- Valid values: '', 'Immediate Start', 'Weekends Only', 'Remote Friendly'
