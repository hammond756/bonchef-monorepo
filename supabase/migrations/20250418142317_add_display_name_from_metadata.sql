-- Update the handle_new_user function to use display_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$;

-- Update existing profiles with display names from user metadata
UPDATE public.profiles p
SET display_name = u.raw_user_meta_data->>'display_name'
FROM auth.users u
WHERE p.id = u.id
  AND u.raw_user_meta_data->>'display_name' IS NOT NULL;
