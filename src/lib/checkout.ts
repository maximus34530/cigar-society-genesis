import { FunctionsHttpError } from "@supabase/functions-js";
import { supabase } from "@/lib/supabase";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function messageFromFunctionsError(error: unknown): Promise<string> {
  if (!(error instanceof Error)) return "Request failed";

  if (error instanceof FunctionsHttpError) {
    const res = error.context;
    if (res instanceof Response) {
      try {
        const body = (await res.clone().json()) as unknown;
        if (isRecord(body) && typeof body.error === "string") return body.error;
      } catch {
        /* ignore */
      }
    }
  }

  return error.message;
}

/** Ensures a fresh access token before invoking Edge Functions (avoids 401 from stale JWT). */
async function ensureSessionForFunctions(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) return;

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) {
    throw new Error("You must be signed in to continue.");
  }
}

/**
 * Starts Stripe Checkout for a booking. Uses `functions.invoke` so auth headers match the
 * Supabase client (raw `fetch` was missing the same wiring and could return 401).
 */
export async function createCheckoutSessionUrl(bookingId: string): Promise<string> {
  await ensureSessionForFunctions();

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { booking_id: bookingId },
  });

  if (error) {
    const msg = await messageFromFunctionsError(error);
    throw new Error(msg);
  }

  const url = isRecord(data) && typeof data.checkout_url === "string" ? data.checkout_url : null;
  if (!url) throw new Error("Missing checkout URL");
  return url;
}
