-- Create a new storage bucket for profile avatars
insert into storage.buckets (id, name, public)
values ('profile_avatars', 'profile_avatars', true);

-- Set up storage policies
create policy "Users can upload their own avatars"
on storage.objects for insert
with check (
  bucket_id = 'profile_avatars' and
  auth.uid() = (storage.foldername(name))[1]::uuid
);

create policy "Anyone can read avatars"
on storage.objects for select
using (
  bucket_id = 'profile_avatars'
);

create policy "Users can delete their own avatars"
on storage.objects for delete
using (
  bucket_id = 'profile_avatars' and
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Add CORS configuration
update storage.buckets
set file_size_limit = 5242880, -- 5MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/heic']
where id = 'profile_avatars';
