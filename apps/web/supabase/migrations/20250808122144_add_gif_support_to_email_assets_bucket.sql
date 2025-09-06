-- Add GIF support to email-assets storage bucket
-- This migration updates the allowed_mime_types for the email-assets bucket to include GIF files

-- Update the storage bucket configuration to allow GIF files
UPDATE storage.buckets 
SET allowed_mime_types = array_append(allowed_mime_types, 'image/gif')
WHERE name = 'email-assets';
