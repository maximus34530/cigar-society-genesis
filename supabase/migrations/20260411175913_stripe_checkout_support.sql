-- Idempotent receipt emails (n8n) after payment
alter table public.bookings add column if not exists receipt_sent_at timestamptz;

comment on column public.bookings.receipt_sent_at is 'Timestamp when the server successfully called the n8n receipt webhook.';

-- Public capacity display on Events page (aggregates paid tickets only; RLS-safe via SECURITY DEFINER)
create or replace function public.event_tickets_sold_batch(p_event_ids uuid[])
returns table (event_id uuid, tickets_sold integer)
language sql
stable
security definer
set search_path = public
as $$
  select u.id as event_id, coalesce(sum(b.tickets), 0)::int as tickets_sold
  from unnest(p_event_ids) as u(id)
  left join public.bookings b on b.event_id = u.id and b.status = 'paid'
  group by u.id;
$$;

revoke all on function public.event_tickets_sold_batch(uuid[]) from public;
grant execute on function public.event_tickets_sold_batch(uuid[]) to anon, authenticated;
