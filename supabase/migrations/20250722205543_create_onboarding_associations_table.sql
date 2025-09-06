create table
  public.onboarding_associations (
    id uuid not null default gen_random_uuid (),
    onboarding_session_id uuid not null,
    recipe_id uuid null,
    job_id uuid null,
    constraint onboarding_associations_pkey primary key (id),
    constraint onboarding_associations_recipe_id_fkey foreign key (recipe_id) references recipes (id) on delete cascade,
    constraint onboarding_associations_job_id_fkey foreign key (job_id) references recipe_import_jobs (id) on delete cascade
  ) tablespace pg_default;
