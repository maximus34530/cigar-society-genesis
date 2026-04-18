-- Phase 5 — Membership & Community (#182)
-- Creates public.memberships (one row per user subscription lifecycle),
-- enables RLS, and exposes is_active_member(uuid) helper for UI gating.
-- Writes to this table are server-side only (Supabase Edge Functions via
-- service-role key). No client INSERT/UPDATE/DELETE policies are granted.

-- 1. Table
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

comment on table public.memberships is
  'Phase 5 subscription state per user. Source of truth is Stripe webhooks '
  '(customer.subscription.*, invoice.*); rows are written server-side only.';
comment on column public.memberships.plan is
  'Stripe-agnostic plan label (e.g. la_sociedad_monthly).';
comment on column public.memberships.status is
  'Stripe-canonical status: incomplete, trialing, active, past_due, unpaid, canceled.';
comment on column public.memberships.cancel_at_period_end is
  'True when the user cancelled in the Stripe Customer Portal; row stays '
  'active until current_period_end and then flips to canceled via webhook.';

-- 2. Indexes
create index if not exists memberships_user_id_idx on public.memberships (user_id);
create index if not exists memberships_status_idx  on public.memberships (status);

-- 3. updated_at trigger
create or replace function public.set_memberships_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_memberships_updated_at();

-- 4. Row Level Security
alter table public.memberships enable row level security;

-- Users may read their own membership row(s).
drop policy if exists "Members can read own membership" on public.memberships;
create policy "Members can read own membership"
  on public.memberships
  for select
  using (auth.uid() = user_id);

-- Admins may read all membership rows. Uses the existing public.is_admin()
-- helper (SECURITY DEFINER) so we stay consistent with the rest of the
-- codebase and avoid the RLS recursion class of bugs that prior migration
-- phase2_fix_is_admin_rls_recursion was introduced to prevent.
drop policy if exists "Admins can read all memberships" on public.memberships;
create policy "Admins can read all memberships"
  on public.memberships
  for select
  using (public.is_admin());

-- No INSERT/UPDATE/DELETE policies are defined by design. Only the service
-- role (used by Supabase Edge Functions) can mutate this table.

-- 5. is_active_member helper (SECURITY DEFINER so UI gating stays cheap,
-- with a self-or-admin guard so users cannot probe arbitrary uuids).
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
    -- Caller can only check themselves, unless they are an admin.
    auth.uid() = p_user_id
    or public.is_admin()
  );
$$;

revoke all on function public.is_active_member(uuid) from public;
grant execute on function public.is_active_member(uuid) to authenticated;

comment on function public.is_active_member(uuid) is
  'Phase 5 helper — true if the given user has an active/trialing membership '
  'whose current_period_end is still in the future. Caller must be the user '
  'themselves or an admin; otherwise returns false.';
