set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'display_name'
  );
  RETURN NEW;
END;$function$
;