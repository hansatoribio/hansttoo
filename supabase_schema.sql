-- Hansttoo consultation storage — review before running manually.
-- This file is intentionally NOT applied by the website build.
-- Public visitors may create a pending inquiry and upload private references.
-- They may not read, update, or delete inquiry, subscriber, or admin data.

create table if not exists public.inquiries (
  id text primary key,
  full_name text not null,
  email text,
  phone text,
  instagram text,
  preferred_contact_method text not null default 'email',
  style text not null,
  color_type text,
  placement text not null,
  placement_photo text,
  size_cm numeric not null,
  description text not null,
  reference_images text[] not null default '{}',
  reference_image text,
  status text not null default 'pending',
  artist_notes text,
  medical_notes text,
  created_at timestamptz not null default now(),
  constraint inquiries_contact_present check (
    nullif(btrim(coalesce(email, '')), '') is not null
    or nullif(btrim(coalesce(phone, '')), '') is not null
    or nullif(btrim(coalesce(instagram, '')), '') is not null
  ),
  constraint inquiries_preferred_contact_valid check (preferred_contact_method in ('email', 'instagram', 'phone', 'whatsapp')),
  constraint inquiries_style_valid check (style in ('anime', 'microrealism', 'fineline', 'other')),
  constraint inquiries_status_valid check (status in ('pending', 'contacted', 'replied', 'booked', 'completed', 'declined')),
  constraint inquiries_size_valid check (size_cm between 1.3 and 127),
  constraint inquiries_name_length check (char_length(full_name) between 1 and 120),
  constraint inquiries_description_length check (char_length(description) between 15 and 5000),
  constraint inquiries_reference_count check (cardinality(reference_images) <= 5)
);

alter table public.inquiries enable row level security;
alter table public.inquiries alter column email drop not null;

-- A user must first exist in Supabase Auth and then be added here by the
-- project owner. The browser cannot add or promote administrators.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;

drop policy if exists admin_users_read_self on public.admin_users;
create policy admin_users_read_self
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists inquiries_select_all on public.inquiries;
drop policy if exists inquiries_insert_all on public.inquiries;
drop policy if exists inquiries_update_all on public.inquiries;
drop policy if exists inquiries_delete_all on public.inquiries;
drop policy if exists public_create_pending_inquiry on public.inquiries;
drop policy if exists admin_read_inquiries on public.inquiries;
drop policy if exists admin_update_inquiries on public.inquiries;

revoke all on table public.inquiries from anon, authenticated;
grant insert on table public.inquiries to anon, authenticated;
grant select, update on table public.inquiries to authenticated;

create policy public_create_pending_inquiry
on public.inquiries
for insert
to anon, authenticated
with check (
  status = 'pending'
  and artist_notes is null
  and medical_notes is null
  and created_at <= now() + interval '5 minutes'
  and char_length(full_name) between 1 and 120
  and char_length(description) between 15 and 5000
  and cardinality(reference_images) <= 5
);

create policy admin_read_inquiries
on public.inquiries
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  )
);

create policy admin_update_inquiries
on public.inquiries
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  )
);

-- Disable the legacy browser-readable admin/settings paths when those tables exist.
do $$
begin
  if to_regclass('public.admin_settings') is not null then
    execute 'alter table public.admin_settings enable row level security';
    execute 'drop policy if exists admin_settings_select_all on public.admin_settings';
    execute 'drop policy if exists admin_settings_update_all on public.admin_settings';
    execute 'drop policy if exists admin_settings_insert_all on public.admin_settings';
    execute 'revoke all on table public.admin_settings from anon, authenticated';
  end if;

  if to_regclass('public.subscribers') is not null then
    execute 'alter table public.subscribers enable row level security';
    execute 'drop policy if exists subscribers_select_all on public.subscribers';
    execute 'drop policy if exists subscribers_insert_all on public.subscribers';
    execute 'drop policy if exists subscribers_delete_all on public.subscribers';
    execute 'revoke all on table public.subscribers from anon, authenticated';
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inquiry-images',
  'inquiry-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists storage_upload_public on storage.objects;
drop policy if exists storage_select_public on storage.objects;
drop policy if exists public_upload_inquiry_reference on storage.objects;
drop policy if exists admin_read_inquiry_references on storage.objects;

create policy public_upload_inquiry_reference
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'inquiry-images'
  and (storage.foldername(name))[1] = 'uploads'
);

create policy admin_read_inquiry_references
on storage.objects
for select
to authenticated
using (
  bucket_id = 'inquiry-images'
  and exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  )
);

-- No anonymous SELECT policy is created: reference images remain private.
-- The /admin route uses Supabase Auth plus these RLS policies. Create the Auth
-- user through the official Supabase interface, then add its UUID to
-- public.admin_users. Never put a service-role key in the website.
