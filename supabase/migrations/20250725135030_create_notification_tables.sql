-- Create notification tables and triggers for email notifications
-- This migration creates the foundation for the email notification system

-- Create notification_queue table to store pending email notifications
create table public.notification_queue (
    id uuid not null default gen_random_uuid(),
    comment_id uuid not null,
    recipe_id uuid not null,
    recipient_id uuid not null,
    created_at timestamp with time zone not null default now(),
    sent boolean not null default false,
    constraint notification_queue_pkey primary key (id),
    constraint notification_queue_comment_id_fkey foreign key (comment_id) references comments (id) on delete cascade,
    constraint notification_queue_recipe_id_fkey foreign key (recipe_id) references recipes (id) on delete cascade,
    constraint notification_queue_recipient_id_fkey foreign key (recipient_id) references profiles (id) on delete cascade
) tablespace pg_default;

-- Create notification_preferences table to store user email preferences
create table public.notification_preferences (
    user_id uuid not null,
    recipe_comment_notifications boolean not null default true,
    updated_at timestamp with time zone not null default now(),
    constraint notification_preferences_pkey primary key (user_id),
    constraint notification_preferences_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
) tablespace pg_default;

-- Create indexes for performance
create index idx_notification_queue_sent on public.notification_queue (sent);
create index idx_notification_queue_created_at on public.notification_queue (created_at);
create index idx_notification_queue_recipient_id on public.notification_queue (recipient_id);

-- Initialize notification preferences for all existing users (set to TRUE by default)
insert into public.notification_preferences (user_id, recipe_comment_notifications)
select id, true
from public.profiles
on conflict (user_id) do nothing;

-- Create function to initialize notification preferences for new users
create or replace function public.init_notification_preferences()
returns trigger as $$
begin
    insert into public.notification_preferences (user_id, recipe_comment_notifications)
    values (NEW.id, true);
    return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create notification preferences for new users
create trigger on_user_created
    after insert on public.profiles
    for each row execute function public.init_notification_preferences();

-- Create function to add notifications to queue when comments are created
create or replace function public.notify_recipe_owner()
returns trigger as $$
declare
    recipe_owner uuid;
    recipe_owner_preferences boolean;
begin
    -- Get the recipe owner
    select user_id into recipe_owner 
    from public.recipes 
    where id = NEW.recipe_id;

    -- Get the recipe owner's notification preferences
    select recipe_comment_notifications into recipe_owner_preferences
    from public.notification_preferences
    where user_id = recipe_owner;

    -- Only add notification if comment is not from recipe owner and recipe owner has enabled notifications
    if recipe_owner != NEW.user_id and recipe_owner_preferences = true then
        insert into public.notification_queue (comment_id, recipe_id, recipient_id)
        values (NEW.id, NEW.recipe_id, recipe_owner);
    end if;

    return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically add notifications to queue when comments are created
create trigger on_comment_insert
    after insert on public.comments
    for each row execute function public.notify_recipe_owner();

-- Create queue entries for existing comments (only for comments where recipe owner has preferences enabled)
insert into public.notification_queue (comment_id, recipe_id, recipient_id)
select 
    c.id as comment_id,
    c.recipe_id,
    r.user_id as recipient_id
from public.comments c
join public.recipes r on c.recipe_id = r.id
join public.notification_preferences np on r.user_id = np.user_id
where c.user_id != r.user_id  -- Don't notify if comment is from recipe owner
  and np.recipe_comment_notifications = true;  -- Only if user has notifications enabled

-- Add RLS policies for notification_queue
alter table public.notification_queue enable row level security;

-- Allow users to see their own notifications (for worker processing)
create policy "Users can see their own notifications" on public.notification_queue
    for select using (auth.uid() = recipient_id);

-- Allow system to insert notifications (via trigger)
create policy "System can insert notifications" on public.notification_queue
    for insert with check (true);

-- Allow system to update notifications (mark as sent)
create policy "System can update notifications" on public.notification_queue
    for update using (true);

-- Add RLS policies for notification_preferences
alter table public.notification_preferences enable row level security;

-- Allow users to see and update their own preferences
create policy "Users can manage their own preferences" on public.notification_preferences
    for all using (auth.uid() = user_id);

-- Allow system to insert preferences (via trigger)
create policy "System can insert preferences" on public.notification_preferences
    for insert with check (true);
