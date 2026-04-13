import { supabase } from "@/lib/supabase";

export async function finalizeCheckoutSession(sessionId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.functions.invoke("finalize-checkout-session", {
    body: { session_id: sessionId },
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
