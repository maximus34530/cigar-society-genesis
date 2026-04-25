-- Store pricing breakdown on bookings so UI/receipts can match Stripe exactly.

alter table public.bookings
  add column if not exists ticket_subtotal_cents integer,
  add column if not exists service_charge_cents integer,
  add column if not exists total_cents integer,
  add column if not exists service_charge_rate numeric;

comment on column public.bookings.ticket_subtotal_cents is 'Ticket subtotal in cents computed server-side at checkout time.';
comment on column public.bookings.service_charge_cents is 'Service charge in cents computed server-side at checkout time.';
comment on column public.bookings.total_cents is 'Total charged in cents (subtotal + service charge).';
comment on column public.bookings.service_charge_rate is 'Service charge rate used to compute service_charge_cents (e.g. 0.14).';

