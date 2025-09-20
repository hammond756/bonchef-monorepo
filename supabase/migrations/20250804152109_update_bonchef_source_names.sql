-- Update all recipes where source_name matches "bonchef" (case insensitive) to empty string
UPDATE public.recipes 
SET source_name = '', 
    source_url = ''
WHERE LOWER(source_name) = 'bonchef';
