-- ============================================================
-- Affinity Remastered — Seed Data + Messages Schema
-- Run this in your Supabase SQL Editor AFTER migration.sql
-- ============================================================

-- 0. Add missing INSERT policy for profiles (needed if user signed up before trigger existed)
DO $$ BEGIN
  CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their conversations"
    ON public.conversations FOR UPDATE
    USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
      conversation_id IN (
        SELECT id FROM public.conversations
        WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Create two test user accounts
-- Credentials:
--   donnel@affinity.app   / Affinity2026!
--   merk@affinity.app  / Affinity2026!

DO $$
DECLARE
  maya_id UUID := gen_random_uuid();
  merk_id UUID := gen_random_uuid();
BEGIN
  -- Donnel
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', maya_id,
    'authenticated', 'authenticated',
    'donnel@affinity.app',
    crypt('Affinity2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Donnel"}',
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    maya_id, maya_id::text, 'donnel@affinity.app',
    json_build_object('sub', maya_id::text, 'email', 'donnel@affinity.app', 'full_name', 'Donnel'),
    'email', now(), now(), now()
  );

  -- Merk
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', merk_id,
    'authenticated', 'authenticated',
    'merk@affinity.app',
    crypt('Affinity2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Merk"}',
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), merk_id, merk_id::text,
    json_build_object('sub', merk_id::text, 'email', 'merk@affinity.app', 'full_name', 'Merk'),
    'email', now(), now(), now()
  );

  -- Update profiles (auto-created by the on_auth_user_created trigger)
  UPDATE public.profiles SET
    bio = 'Film photographer & tea enthusiast. Finding beauty in the quiet, the considered, and the overlooked.',
    location = 'Tokyo, Japan',
    interests = ARRAY['Film Photography', 'Tea Ceremony', 'Travel', 'Minimalism', 'Literature'],
    avatar_url = 'https://images.unsplash.com/photo-1763385128836-053af3c6a91f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
  WHERE id = maya_id;

  UPDATE public.profiles SET
    bio = 'Architect by day, record collector by night. I design spaces that breathe.',
    location = 'Seoul, South Korea',
    interests = ARRAY['Architecture', 'Vinyl Records', 'Jazz', 'Urban Photography', 'Cooking'],
    avatar_url = 'https://images.unsplash.com/photo-1752649935868-dd9080445d18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
  WHERE id = merk_id;

  -- Make them follow each other
  INSERT INTO public.follows (follower_id, following_id) VALUES (maya_id, merk_id);
  INSERT INTO public.follows (follower_id, following_id) VALUES (merk_id, maya_id);

END $$;

-- 6. Enable Realtime for messages (for live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
