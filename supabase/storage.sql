-- ============================================================
-- Affinity Remastered — Storage Setup for Profile Images
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add cover_url column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_url TEXT DEFAULT '';

-- 2. Create the storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies — allow authenticated users to upload/read
DO $$ BEGIN
  CREATE POLICY "Anyone can view uploads"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'user-uploads');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'user-uploads'
      AND auth.role() = 'authenticated'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own uploads"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'user-uploads'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own uploads"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'user-uploads'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
