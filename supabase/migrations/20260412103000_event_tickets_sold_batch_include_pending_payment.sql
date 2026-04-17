-- Capacity: count paid and unpaid checkout holds toward tickets sold (public RPC + UI)
create or replace function public.event_tickets_sold_batch(p_event_ids uuid[])
returns table (event_id uuid, tickets_sold integer)
language sql
stable
security definer
set search_path = public
as $$
  select u.id as event_id, coalesce(sum(b.tickets), 0)::int as tickets_sold
  from unnest(p_event_ids) as u(id)
  left join public.bookings b
    on b.event_id = u.id and b.status in ('paid', 'pending_payment')
  group by u.id;
$$;
