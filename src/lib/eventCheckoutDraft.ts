export const EVENT_CHECKOUT_RESUME_PATH = "/events?checkout_resume=1";

export type EventCheckoutPendingAction = "free_reserve" | "paid_checkout";

export type EventCheckoutDraft = {
  eventId: string;
  tickets: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pendingAction: EventCheckoutPendingAction;
  exp: number;
};

const KEY = "cigar_society_event_checkout_draft";
const TTL_MS = 1000 * 60 * 60;

export function stashEventCheckoutDraft(draft: Omit<EventCheckoutDraft, "exp">): void {
  try {
    const payload: EventCheckoutDraft = { ...draft, exp: Date.now() + TTL_MS };
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
}

export function peekEventCheckoutDraft(): EventCheckoutDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EventCheckoutDraft;
    if (
      typeof parsed.eventId !== "string" ||
      typeof parsed.firstName !== "string" ||
      typeof parsed.lastName !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.phone !== "string" ||
      typeof parsed.exp !== "number" ||
      (parsed.pendingAction !== "free_reserve" && parsed.pendingAction !== "paid_checkout")
    ) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    if (Date.now() > parsed.exp) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    const tickets = Number(parsed.tickets);
    if (!Number.isFinite(tickets)) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return { ...parsed, tickets: Math.trunc(tickets) };
  } catch {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function takeEventCheckoutDraft(): EventCheckoutDraft | null {
  const d = peekEventCheckoutDraft();
  if (d) {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
  return d;
}
