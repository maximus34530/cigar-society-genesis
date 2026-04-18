/** Service charge rate applied to ticket subtotal at checkout (see Terms for tax disclosure). */
export const EVENT_TICKET_SERVICE_CHARGE_RATE = 0.14;

export function eventTicketSubtotalCents(unitPriceUsd: number, ticketCount: number): number {
  const unitCents = Math.round(Number(unitPriceUsd) * 100);
  if (!Number.isFinite(unitCents) || unitCents <= 0) return 0;
  const qty = Math.max(1, Math.trunc(ticketCount));
  return unitCents * qty;
}

export function eventServiceChargeCentsFromSubtotalCents(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  const raw = Math.round(subtotalCents * EVENT_TICKET_SERVICE_CHARGE_RATE);
  return raw > 0 ? raw : 1;
}

export function eventCheckoutTotalCents(unitPriceUsd: number, ticketCount: number): number {
  const sub = eventTicketSubtotalCents(unitPriceUsd, ticketCount);
  const svc = eventServiceChargeCentsFromSubtotalCents(sub);
  return sub + svc;
}

export function formatUsdFromCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
