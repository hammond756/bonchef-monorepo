ALTER TABLE public.recipe_creation_prototype
ADD COLUMN status text NOT NULL DEFAULT 'DRAFT';

UPDATE public.recipe_creation_prototype
SET status = 'PUBLISHED';
