-- supabase/migrations/00000000000000_bootstrap_production_schema.sql
--
-- Bootstrap: recreate the complete production schema on a fresh Supabase
-- project (Phase 5 testing branch: ingqvayyjzhqksjgnely).
--
-- Source of truth: production (cxhftirtdoqeqnhdegdd), read via SQL editor:
--   information_schema.columns / pg_policies / information_schema.routines /
--   information_schema.table_constraints / pg_indexes /
--   information_schema.triggers / pg_extension.
--
-- Fully idempotent (CREATE ... IF NOT EXISTS / CREATE OR REPLACE / DROP ...
-- IF EXISTS + CREATE). Safe to run before every migration in this folder.
--
-- ORDERING CONTRACT (important):
--   `language sql` functions are parsed and bound at CREATE time, so any
--   tables or functions they reference must already exist. PL/pgSQL bodies
--   are validated at CALL time, so forward refs are tolerated. Sections are
--   therefore: extensions -> tables -> trigger fns -> is_admin (plpgsql) ->
--   SQL fns (is_active_member, event_tickets_sold_batch) -> remaining
--   plpgsql fns -> indexes -> triggers -> RLS.
--
-- KNOWN INFERENCES (approved with user before drafting):
--   (a) on_auth_user_created trigger on auth.users -- not in public triggers.
--   (b) Event trigger binding rls_auto_enable() -- not in information_schema.
--   (c) ON DELETE rules for FKs to auth.users/events -- not in source data.
--   (d) SECURITY DEFINER on is_admin()/handle_new_user() -- not in routines.

-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
-- pg_graphql, pg_stat_statements, supabase_vault, plpgsql are provisioned by
-- Supabase on every project and are not recreated here.


-- =============================================================================
-- 2. TABLES
-- Created before SQL-language functions so their CREATE-time parsing
-- resolves cleanly.
-- =============================================================================

-- 2a. profiles -- 1:1 with auth.users, carries role + display fields.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint profiles_role_check check (role = any (array['user'::text, 'client'::text, 'admin'::text]))
);

-- 2b. events -- public event catalog, soft-deletable.
-- Note: created_at is `timestamp without time zone` on production -- matched.
create table if not exists public.events (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  date                    date not null,
  time                    text not null,
  price                   numeric not null,
  description             text,
  image_url               text,
  is_active               boolean default true,
  created_at              timestamp default now(),
  image_path              text,
  deleted_at              timestamptz,
  capacity_total          integer,
  image_object_position   text,
  constraint events_capacity_total_nonnegative check ((capacity_total is null) or (capacity_total >= 0))
);

-- 2c. bookings -- reservations and Stripe purchase state.
-- Note: created_at is `timestamp without time zone` on production -- matched.
create table if not exists public.bookings (
  id                          uuid primary key default gen_random_uuid(),
  event_id                    uuid references public.events(id) on delete set null,
  name                        text not null,
  email                       text not null,
  phone                       text not null,
  tickets                     integer not null,
  total_paid                  numeric not null,
  stripe_payment_id           text,
  created_at                  timestamp default now(),
  user_id                     uuid references auth.users(id) on delete set null,
  status                      text not null default 'reserved',
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  paid_at                     timestamptz,
  cancelled_at                timestamptz,
  receipt_sent_at             timestamptz
);

-- 2d. clients -- CRM contact list (admin-only).
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- 2e. session_categories -- catalog of paid session types.
create table if not exists public.session_categories (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  duration_minutes  integer,
  price             numeric,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- 2f. memberships -- Phase 5 subscription state.
-- Also owned by 20260418230000_phase5_memberships.sql; kept here so this file
-- is a complete standalone snapshot. Both use idempotent patterns so running
-- them in order on the branch is safe.
create table if not exists public.memberships (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  plan                      text not null,
  status                    text not null,
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  cancel_at_period_end      boolean not null default false,
  stripe_customer_id        text,
  stripe_subscription_id    text unique,
  stripe_price_id           text,
  last_invoice_id           text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);


-- =============================================================================
-- 3. TRIGGER FUNCTIONS (plpgsql -- no external refs validated at CREATE)
-- =============================================================================

-- 3a. Generic updated_at bump (used by profiles trigger)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3b. Memberships-specific updated_at bump
create or replace function public.set_memberships_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- =============================================================================
-- 4. is_admin (plpgsql) -- created before SQL fns that call it.
-- SECURITY DEFINER + pinned search_path avoids the RLS-recursion class of
-- bugs previously fixed in phase2_fix_is_admin_rls_recursion on production.
-- =============================================================================

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
end;
$$;


-- =============================================================================
-- 5. SQL-LANGUAGE FUNCTIONS (validated at CREATE -- tables & is_admin must exist)
-- =============================================================================

-- 5a. is_active_member -- Phase 5 UI gating helper.
create or replace function public.is_active_member(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.user_id = p_user_id
      and m.status in ('active', 'trialing')
      and (m.current_period_end is null or m.current_period_end > now())
  )
  and (
    auth.uid() = p_user_id
    or public.is_admin()
  );
$$;

-- 5b. event_tickets_sold_batch -- capacity calculation for events UI.
create or replace function public.event_tickets_sold_batch(p_event_ids uuid[])
returns table (event_id uuid, tickets_sold int)
language sql
stable
as $$
  select u.id as event_id, coalesce(sum(b.tickets), 0)::int as tickets_sold
  from unnest(p_event_ids) as u(id)
  left join public.bookings b
    on b.event_id = u.id and b.status in ('paid', 'pending_payment')
  group by u.id;
$$;


-- =============================================================================
-- 6. REMAINING PL/pgSQL FUNCTIONS (runtime-validated)
-- =============================================================================

-- 6a. handle_new_user -- creates a public.profiles row on auth signup.
-- SECURITY DEFINER so it can insert regardless of RLS.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 6b. rls_auto_enable -- event-trigger function that auto-enables RLS on
-- any new table created in the public schema.
create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
as $$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name is not null
       and cmd.schema_name in ('public')
       and cmd.schema_name not in ('pg_catalog', 'information_schema')
       and cmd.schema_name not like 'pg_toast%'
       and cmd.schema_name not like 'pg_temp%' then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception when others then
        raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    else
      raise log 'rls_auto_enable: skip % (system schema or not in enforced list: %.)',
                cmd.object_identity, cmd.schema_name;
    end if;
  end loop;
end;
$$;


-- =============================================================================
-- 7. GRANTS
-- =============================================================================

-- Mirror phase5_memberships migration for is_active_member.
revoke all on function public.is_active_member(uuid) from public;
grant execute on function public.is_active_member(uuid) to authenticated;


-- =============================================================================
-- 8. INDEXES (non-primary-key, non-unique-constraint)
-- =============================================================================

create index if not exists bookings_user_id_idx    on public.bookings (user_id);
create index if not exists events_deleted_at_idx   on public.events (deleted_at);
create index if not exists memberships_user_id_idx on public.memberships (user_id);
create index if not exists memberships_status_idx  on public.memberships (status);


-- =============================================================================
-- 9. TRIGGERS
-- =============================================================================

-- 9a. profiles.updated_at bump
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 9b. memberships.updated_at bump
drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_memberships_updated_at();

-- 9c. auth.users -> public.profiles bootstrap.
-- NOT in the source data (trigger_schema was filtered to 'public'); added
-- using canonical Supabase pattern. Without this, handle_new_user() never
-- fires and new signups won't get profiles rows.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 9d. rls_auto_enable event trigger.
-- NOT in information_schema.triggers (DDL event triggers live elsewhere).
-- Recreated so new public tables continue to get RLS auto-enabled.
drop event trigger if exists rls_auto_enable;
create event trigger rls_auto_enable
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.rls_auto_enable();


-- =============================================================================
-- 10. ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles           enable row level security;
alter table public.events             enable row level security;
alter table public.bookings           enable row level security;
alter table public.clients            enable row level security;
alter table public.session_categories enable row level security;
alter table public.memberships        enable row level security;

-- 10a. profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((id = auth.uid()) or is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((id = auth.uid()) or is_admin())
  with check ((id = auth.uid()) or is_admin());

-- 10b. events
drop policy if exists events_admin_all on public.events;
create policy events_admin_all
  on public.events
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists events_select_active_public on public.events;
create policy events_select_active_public
  on public.events
  for select
  to anon, authenticated
  using ((deleted_at is null) and ((coalesce(is_active, false) = true) or is_admin()));

-- 10c. bookings
drop policy if exists bookings_admin_all on public.bookings;
create policy bookings_admin_all
  on public.bookings
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists bookings_select_own on public.bookings;
create policy bookings_select_own
  on public.bookings
  for select
  to authenticated
  using (is_admin() or (user_id = auth.uid()));

drop policy if exists bookings_insert_own on public.bookings;
create policy bookings_insert_own
  on public.bookings
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists bookings_delete_own on public.bookings;
create policy bookings_delete_own
  on public.bookings
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 10d. clients
drop policy if exists clients_admin_all on public.clients;
create policy clients_admin_all
  on public.clients
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- 10e. session_categories
drop policy if exists session_categories_admin_all on public.session_categories;
create policy session_categories_admin_all
  on public.session_categories
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- 10f. memberships
-- Production roles column was {public}, not {authenticated} -- matches the
-- phase5_memberships migration, which omits `to` and defaults to public.
drop policy if exists "Members can read own membership" on public.memberships;
create policy "Members can read own membership"
  on public.memberships
  for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can read all memberships" on public.memberships;
create policy "Admins can read all memberships"
  on public.memberships
  for select
  using (is_admin());

-- End of bootstrap.
