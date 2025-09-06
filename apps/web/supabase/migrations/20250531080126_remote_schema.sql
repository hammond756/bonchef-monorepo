create policy "Anyone can read avatars"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'profile_avatars'::text));


create policy "Enable insert for authenticated users only"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can delete their own avatars"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'profile_avatars'::text) AND (auth.uid() = ((storage.foldername(name))[1])::uuid)));


create policy "Users can delete their own images"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'chat-images'::text) AND (auth.uid() = ((storage.foldername(name))[1])::uuid)));


create policy "Users can read their own images"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'chat-images'::text) AND (auth.uid() = ((storage.foldername(name))[1])::uuid)));


create policy "Users can upload their own avatars"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'profile_avatars'::text) AND (auth.uid() = ((storage.foldername(name))[1])::uuid)));


create policy "Users can upload their own images"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'chat-images'::text) AND (auth.uid() = ((storage.foldername(name))[1])::uuid)));



