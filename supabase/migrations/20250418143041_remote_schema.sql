create extension if not exists "pg_net" with schema "public" version '0.10.0';

set check_function_bodies = off;

CREATE TRIGGER "add-user-to-email-list" AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://lwnjybqifrnppmahxera.supabase.co/functions/v1/add-user-to-email-campaign', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bmp5YnFpZnJucHBtYWh4ZXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyMTI3NjksImV4cCI6MjA0Mzc4ODc2OX0.mKwJ1_Yh6D2JDw9GXDMu-efihP02OdFiYVaGwYZlFSI"}', '{}', '5000');


