-- Add email-assets bucket for email templates
-- This bucket will store email assets like logos and images

-- Create policy for public read access to email assets
create policy "Anyone can read email assets"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'email-assets'::text));

-- Create policy for system to upload email assets
create policy "System can upload email assets"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'email-assets'::text));

-- Create policy for system to update email assets
create policy "System can update email assets"
on "storage"."objects"
as permissive
for update
to authenticated
using ((bucket_id = 'email-assets'::text));

-- Create policy for system to delete email assets
create policy "System can delete email assets"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((bucket_id = 'email-assets'::text));
