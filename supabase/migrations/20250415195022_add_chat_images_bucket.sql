-- Create a new storage bucket for chat images
insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', false);

-- Set up storage policies
create policy "Users can upload their own images"
on storage.objects for insert
with check (
  bucket_id = 'chat-images' and
  auth.uid() = (storage.foldername(name))[1]::uuid
);

create policy "Users can read their own images"
on storage.objects for select
using (
  bucket_id = 'chat-images' and
  auth.uid() = (storage.foldername(name))[1]::uuid
);

create policy "Users can delete their own images"
on storage.objects for delete
using (
  bucket_id = 'chat-images' and
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Add CORS configuration
update storage.buckets
set file_size_limit = 5242880, -- 5MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/heic']
where id = 'chat-images'; 