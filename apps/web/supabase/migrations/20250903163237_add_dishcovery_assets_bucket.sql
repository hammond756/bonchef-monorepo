-- Create dishcovery-assets bucket for organizing dishcovery session assets
-- This bucket will store photos and audio files organized by session timestamp

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dishcovery-assets',
  'dishcovery-assets',
  true,
  52428800, -- 50MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'audio/mpeg', 'audio/webm']
);

-- Verify the bucket was created
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'dishcovery-assets';
