-- Run this in your Supabase SQL Editor
-- Safe to run multiple times (idempotent)

-- 1. Create connections table
CREATE TABLE IF NOT EXISTS public.connections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sender_id, receiver_id)
);

-- 2. Add status column (pending / accepted / declined)
ALTER TABLE public.connections
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'accepted', 'declined'));

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_connections_sender   ON public.connections (sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON public.connections (receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status   ON public.connections (status);

-- 4. RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own connections"  ON public.connections;
DROP POLICY IF EXISTS "Users can read own connections"    ON public.connections;
DROP POLICY IF EXISTS "Users can update own connections"  ON public.connections;
DROP POLICY IF EXISTS "Users can delete own connections"  ON public.connections;

CREATE POLICY "Users can insert own connections"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read own connections"
  ON public.connections FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Receiver can accept or decline (update status)
CREATE POLICY "Users can update own connections"
  ON public.connections FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Users can delete own connections"
  ON public.connections FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
