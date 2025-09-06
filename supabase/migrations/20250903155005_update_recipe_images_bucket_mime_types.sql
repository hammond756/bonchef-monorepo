-- Update recipe-images bucket to support additional image formats
-- Add support for WebP and AVIF formats

-- Update the bucket policy to allow the new MIME types
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/avif']
WHERE 
  name = 'recipe-images';

-- Verify the update
SELECT name, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'recipe-images';
