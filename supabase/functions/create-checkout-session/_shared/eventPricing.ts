/** Keep in sync with `src/lib/eventCheckoutPricing.ts`. */
export const EVENT_TICKET_SERVICE_CHARGE_RATE = 0.14;

export function eventTicketSubtotalCents(unitCents: number, qty: number): number {
  if (!Number.isFinite(unitCents) || unitCents <= 0) return 0;
  const q = Math.max(1, Math.trunc(qty));
  return unitCents * q;
}

export function eventServiceChargeCentsFromSubtotalCents(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  const raw = Math.round(subtotalCents * EVENT_TICKET_SERVICE_CHARGE_RATE);
  return raw > 0 ? raw : 1;
}
