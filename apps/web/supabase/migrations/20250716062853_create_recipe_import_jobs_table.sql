create type public.recipe_import_status as enum ('pending', 'completed', 'failed');
create type public.recipe_import_source_type as enum ('url', 'image', 'text');

create table public.recipe_import_jobs (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    status public.recipe_import_status not null default 'pending'::public.recipe_import_status,
    source_type public.recipe_import_source_type not null,
    source_data text not null,
    recipe_id uuid null,
    error_message text null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint recipe_import_jobs_pkey primary key (id),
    constraint recipe_import_jobs_recipe_id_fkey foreign key (recipe_id) references recipe_creation_prototype (id) on delete set null,
    constraint recipe_import_jobs_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

alter table public.recipe_import_jobs enable row level security;

create policy "Users can see their own import jobs." on public.recipe_import_jobs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own import jobs." on public.recipe_import_jobs for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own import jobs." on public.recipe_import_jobs for update
    using (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create trigger set_timestamp
before update on public.recipe_import_jobs
for each row execute procedure public.trigger_set_timestamp();
