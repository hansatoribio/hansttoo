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
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  gbraid text,
  wbraid text,
  fbclid text,
  landing_path text not null default '/',
  status text not null default 'pending',
  viewed_at timestamptz,
  tags text[] not null default '{}',
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
alter table public.inquiries add column if not exists utm_source text;
alter table public.inquiries add column if not exists utm_medium text;
alter table public.inquiries add column if not exists utm_campaign text;
alter table public.inquiries add column if not exists utm_content text;
alter table public.inquiries add column if not exists utm_term text;
alter table public.inquiries add column if not exists gclid text;
alter table public.inquiries add column if not exists gbraid text;
alter table public.inquiries add column if not exists wbraid text;
alter table public.inquiries add column if not exists fbclid text;
alter table public.inquiries add column if not exists landing_path text not null default '/';
alter table public.inquiries add column if not exists tags text[] not null default '{}';

-- Existing consultations are treated as already reviewed. New rows remain
-- unread until the administrator opens them for the first time.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'inquiries' and column_name = 'viewed_at'
  ) then
    alter table public.inquiries add column viewed_at timestamptz default now();
    alter table public.inquiries alter column viewed_at drop default;
  end if;
end $$;

alter table public.inquiries drop constraint if exists inquiries_tags_count;
alter table public.inquiries add constraint inquiries_tags_count check (cardinality(tags) <= 8);

alter table public.inquiries drop constraint if exists inquiries_attribution_length;
alter table public.inquiries add constraint inquiries_attribution_length check (
  char_length(coalesce(utm_source, '')) <= 200
  and char_length(coalesce(utm_medium, '')) <= 200
  and char_length(coalesce(utm_campaign, '')) <= 200
  and char_length(coalesce(utm_content, '')) <= 200
  and char_length(coalesce(utm_term, '')) <= 200
  and char_length(coalesce(gclid, '')) <= 500
  and char_length(coalesce(gbraid, '')) <= 500
  and char_length(coalesce(wbraid, '')) <= 500
  and char_length(coalesce(fbclid, '')) <= 500
  and char_length(landing_path) between 1 and 300
);

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
drop policy if exists "Permitir envíos públicos de consultas" on public.inquiries;
drop policy if exists "Permitir lectura de consultas" on public.inquiries;
drop policy if exists "Permitir actualizar estado de consultas" on public.inquiries;
drop policy if exists inquiries_all on public.inquiries;
drop policy if exists inquiries_admin_all on public.inquiries;
drop policy if exists inquiries_public_insert on public.inquiries;
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
  and viewed_at is null
  and cardinality(tags) = 0
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

-- Privacy-conscious first-party traffic measurement. Events contain random
-- browser/session identifiers and coarse dimensions only; no IP address,
-- full referrer, query string, user agent, or contact information is stored.
alter table public.inquiries add column if not exists analytics_visitor_id uuid;
alter table public.inquiries add column if not exists analytics_session_id uuid;

create index if not exists inquiries_analytics_visitor_id_idx
on public.inquiries (analytics_visitor_id)
where analytics_visitor_id is not null;

create index if not exists inquiries_analytics_session_id_idx
on public.inquiries (analytics_session_id)
where analytics_session_id is not null;

create table if not exists public.site_visit_events (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  session_id uuid not null,
  page_path text not null,
  source text not null default 'direct',
  device_type text not null default 'desktop',
  language text not null default 'en',
  created_at timestamptz not null default now(),
  constraint site_visit_events_path_valid check (
    char_length(page_path) between 1 and 300
    and left(page_path, 1) = '/'
    and position('?' in page_path) = 0
    and position('#' in page_path) = 0
  ),
  constraint site_visit_events_source_valid check (
    source in ('google', 'meta', 'direct', 'referral', 'other')
  ),
  constraint site_visit_events_device_valid check (
    device_type in ('mobile', 'tablet', 'desktop')
  ),
  constraint site_visit_events_language_valid check (language in ('en', 'es'))
);

create index if not exists site_visit_events_created_at_idx
on public.site_visit_events (created_at desc);

create index if not exists site_visit_events_visitor_created_idx
on public.site_visit_events (visitor_id, created_at desc);

create index if not exists site_visit_events_session_created_idx
on public.site_visit_events (session_id, created_at desc);

create index if not exists site_visit_events_source_created_idx
on public.site_visit_events (source, created_at desc);

alter table public.site_visit_events enable row level security;

drop policy if exists public_record_site_visit on public.site_visit_events;
drop policy if exists admin_read_site_visits on public.site_visit_events;

revoke all on table public.site_visit_events from anon, authenticated;
grant insert on table public.site_visit_events to anon, authenticated;
grant select on table public.site_visit_events to authenticated;
grant usage, select on sequence public.site_visit_events_id_seq to anon, authenticated;

create policy public_record_site_visit
on public.site_visit_events
for insert
to anon, authenticated
with check (
  created_at between now() - interval '5 minutes' and now() + interval '5 minutes'
  and char_length(page_path) between 1 and 300
  and left(page_path, 1) = '/'
  and source in ('google', 'meta', 'direct', 'referral', 'other')
  and device_type in ('mobile', 'tablet', 'desktop')
  and language in ('en', 'es')
);

create policy admin_read_site_visits
on public.site_visit_events
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  )
);

-- Aggregation stays inside Postgres so the panel never needs to download raw
-- visit rows. SECURITY INVOKER preserves the RLS checks above.
create or replace function public.get_admin_visit_metrics(p_days integer default 30)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with params as (
    select greatest(1, least(coalesce(p_days, 30), 90))::integer as days
  ),
  bounds as (
    select
      days,
      (now() at time zone 'America/New_York')::date as today,
      (((now() at time zone 'America/New_York')::date - (days - 1))::timestamp at time zone 'America/New_York') as period_start
    from params
  ),
  period_events as (
    select event.*
    from public.site_visit_events event, bounds
    where event.created_at >= bounds.period_start
  ),
  daily_series as (
    select generate_series(bounds.today - (bounds.days - 1), bounds.today, interval '1 day')::date as day
    from bounds
  ),
  daily_counts as (
    select
      series.day,
      count(distinct event.visitor_id)::integer as visitors,
      count(distinct event.session_id)::integer as sessions,
      count(event.id)::integer as page_views
    from daily_series series
    left join period_events event
      on (event.created_at at time zone 'America/New_York')::date = series.day
    group by series.day
    order by series.day
  ),
  source_counts as (
    select source, count(*)::integer as page_views
    from period_events
    group by source
    order by page_views desc, source
  ),
  device_counts as (
    select device_type, count(*)::integer as page_views
    from period_events
    group by device_type
    order by page_views desc, device_type
  ),
  page_counts as (
    select page_path, count(*)::integer as page_views
    from period_events
    group by page_path
    order by page_views desc, page_path
    limit 8
  ),
  lead_counts as (
    select
      count(*)::integer as leads,
      count(distinct analytics_session_id)::integer as converted_sessions
    from public.inquiries, bounds
    where created_at >= bounds.period_start
  ),
  period_totals as (
    select
      count(distinct visitor_id)::integer as visitors,
      count(distinct session_id)::integer as sessions,
      count(*)::integer as page_views
    from period_events
  )
  select jsonb_build_object(
    'periodDays', (select days from bounds),
    'totalVisitors', (select count(distinct visitor_id)::integer from public.site_visit_events),
    'totalPageViews', (select count(*)::integer from public.site_visit_events),
    'visitorsToday', (
      select count(distinct visitor_id)::integer
      from public.site_visit_events, bounds
      where (created_at at time zone 'America/New_York')::date = bounds.today
    ),
    'visitors7Days', (
      select count(distinct visitor_id)::integer
      from public.site_visit_events
      where created_at >= now() - interval '7 days'
    ),
    'visitors30Days', (
      select count(distinct visitor_id)::integer
      from public.site_visit_events
      where created_at >= now() - interval '30 days'
    ),
    'periodVisitors', (select visitors from period_totals),
    'periodSessions', (select sessions from period_totals),
    'periodPageViews', (select page_views from period_totals),
    'periodLeads', (select leads from lead_counts),
    'conversionRate', (
      select case
        when period_totals.sessions = 0 then 0
        else round((lead_counts.converted_sessions::numeric / period_totals.sessions::numeric) * 100, 1)
      end
      from period_totals, lead_counts
    ),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', day,
        'visitors', visitors,
        'sessions', sessions,
        'pageViews', page_views
      ) order by day)
      from daily_counts
    ), '[]'::jsonb),
    'sources', coalesce((
      select jsonb_agg(jsonb_build_object('source', source, 'pageViews', page_views) order by page_views desc)
      from source_counts
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('device', device_type, 'pageViews', page_views) order by page_views desc)
      from device_counts
    ), '[]'::jsonb),
    'topPages', coalesce((
      select jsonb_agg(jsonb_build_object('path', page_path, 'pageViews', page_views) order by page_views desc)
      from page_counts
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.get_admin_visit_metrics(integer) from public, anon;
grant execute on function public.get_admin_visit_metrics(integer) to authenticated;

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
drop policy if exists inquiry_images_public_insert on storage.objects;
drop policy if exists inquiry_images_admin_read on storage.objects;
drop policy if exists inquiry_images_admin_delete on storage.objects;
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
