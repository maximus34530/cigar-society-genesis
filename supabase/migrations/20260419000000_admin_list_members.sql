-- Phase 5 — Admin members tab (#191)
--
-- Why this exists:
-- `auth.users.email` is not exposed to browser clients by Supabase. The admin
-- members tab needs to display each member's email next to their membership
-- row. Rather than denormalizing email into `public.profiles`, we expose a
-- narrowly-scoped `SECURITY DEFINER` function that joins memberships with
-- profiles and auth.users, gated by the existing `public.is_admin()` helper.
--
-- This is additive only:
--   - Creates one new function, `public.admin_list_members()`.
--   - Does not alter any table, policy, trigger, or existing function.
--   - Leaves the existing admin RLS policy on `public.memberships` untouched.
--
-- Defense in depth:
--   1. `/admin` routes are gated client-side by <RequireAdmin>.
--   2. This function refuses to return rows unless the caller is an admin.
--   3. EXECUTE is granted to `authenticated` only; explicitly revoked from
--      `anon` and `public`.

create or replace function public.admin_list_members()
returns table (
  membership_id           uuid,
  user_id                 uuid,
  full_name               text,
  email                   text,
  plan                    text,
  status                  text,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean,
  stripe_customer_id      text,
  created_at              timestamptz,
  updated_at              timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  select
    m.id                    as membership_id,
    m.user_id               as user_id,
    p.full_name             as full_name,
    u.email::text           as email,
    m.plan                  as plan,
    m.status                as status,
    m.current_period_end    as current_period_end,
    m.cancel_at_period_end  as cancel_at_period_end,
    m.stripe_customer_id    as stripe_customer_id,
    m.created_at            as created_at,
    m.updated_at            as updated_at
  from public.memberships m
  left join public.profiles p on p.id = m.user_id
  left join auth.users       u on u.id = m.user_id
  order by m.created_at desc;
end;
$$;

revoke execute on function public.admin_list_members() from public;
revoke execute on function public.admin_list_members() from anon;
grant  execute on function public.admin_list_members() to authenticated;

comment on function public.admin_list_members() is
  'Phase 5 (#191) — admin-only read of memberships joined with profile + auth email. '
  'Guarded by public.is_admin(); executes with definer privileges to read auth.users.';
