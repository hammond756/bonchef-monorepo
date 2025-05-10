-- Add profile fields to public.profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT
