-- Phase 2 / Post-launch: normalize event start time for automatic expiry.
-- Adds `starts_at` (timestamptz) and keeps it in sync with legacy `date` + `time`.

alter table public.events
  add column if not exists starts_at timestamptz,
  add column if not exists timezone text not null default 'America/Chicago';

comment on column public.events.starts_at is 'Event start timestamp (derived from legacy date+time) used for ordering + auto-expiry.';
comment on column public.events.timezone is 'IANA timezone used when parsing date+time into starts_at (default America/Chicago).';

create index if not exists events_starts_at_idx on public.events(starts_at);

-- Parse legacy date/time text into a timestamptz in the given timezone.
-- We keep this robust because admin time input is freeform (e.g. "8:00 PM", "8 PM", "20:00").
create or replace function public.parse_event_starts_at(p_date text, p_time text, p_tz text)
returns timestamptz
language plpgsql
stable
as $$
declare
  dt_text text;
  ts timestamp;
begin
  if p_date is null or btrim(p_date) = '' then
    return null;
  end if;

  dt_text := btrim(p_date) || ' ' || btrim(coalesce(p_time, ''));

  -- Try common formats. If none match, return null (we won't block writes).
  begin
    ts := to_timestamp(dt_text, 'YYYY-MM-DD HH12:MI AM');
    return (ts at time zone coalesce(nullif(btrim(p_tz), ''), 'America/Chicago'));
  exception when others then
    -- continue
  end;

  begin
    ts := to_timestamp(dt_text, 'YYYY-MM-DD HH12 AM');
    return (ts at time zone coalesce(nullif(btrim(p_tz), ''), 'America/Chicago'));
  exception when others then
  end;

  begin
    ts := to_timestamp(dt_text, 'YYYY-MM-DD HH24:MI');
    return (ts at time zone coalesce(nullif(btrim(p_tz), ''), 'America/Chicago'));
  exception when others then
  end;

  begin
    ts := to_timestamp(dt_text, 'YYYY-MM-DD HH24');
    return (ts at time zone coalesce(nullif(btrim(p_tz), ''), 'America/Chicago'));
  exception when others then
  end;

  return null;
end;
$$;

-- Keep starts_at in sync on insert/update of legacy fields.
create or replace function public.events_set_starts_at()
returns trigger
language plpgsql
as $$
begin
  -- If starts_at is explicitly provided, keep it.
  if new.starts_at is not null then
    return new;
  end if;

  new.starts_at := public.parse_event_starts_at(new.date, new.time, new.timezone);
  return new;
end;
$$;

drop trigger if exists trg_events_set_starts_at on public.events;
create trigger trg_events_set_starts_at
before insert or update of date, time, timezone, starts_at
on public.events
for each row
execute function public.events_set_starts_at();

-- Backfill for existing rows.
update public.events
set starts_at = public.parse_event_starts_at(date, time, timezone)
where starts_at is null and date is not null and btrim(date) <> '';

-- Optional automation primitive used by scheduled expiry.
create or replace function public.expire_old_events(p_hours_past_start integer default 12)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.events
  set is_active = false
  where is_active = true
    and deleted_at is null
    and starts_at is not null
    and starts_at < (now() - make_interval(hours => greatest(0, coalesce(p_hours_past_start, 12))));

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.expire_old_events(integer) from public;
grant execute on function public.expire_old_events(integer) to service_role;

-- Best-effort: if pg_cron is available, schedule expiry hourly.
do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    -- ignore if extension isn't available
  end;

  begin
    perform cron.schedule(
      'expire_old_events_hourly',
      '0 * * * *',
      $$select public.expire_old_events(12);$$
    );
  exception when others then
    -- ignore if cron isn't available or schedule exists
  end;
end $$;

