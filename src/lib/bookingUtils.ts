export type UserBookingRow = {
  id: string;
  tickets: number;
  total_paid: number;
  status: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  events: { id: string; name: string; date: string; time: string } | { id: string; name: string; date: string; time: string }[] | null;
};

export function errorMessage(value: unknown, fallback: string) {
  if (value instanceof Error) return value.message;
  if (typeof value === "object" && value && "message" in value && typeof (value as { message?: unknown }).message === "string") {
    return (value as { message: string }).message;
  }
  return fallback;
}

export function parseEventDateTime(date: string, time: string) {
  const d = new Date(`${date}T${time}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function embeddedEvent(row: UserBookingRow) {
  if (!row.events) return null;
  return Array.isArray(row.events) ? row.events[0] ?? null : row.events;
}
