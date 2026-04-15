import { supabase } from "@/lib/supabase";
import { stashOAuthReturnPath } from "@/lib/authRouting";

export type OAuthProviderId = "google";

function getAuthCallbackUrl(): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : (import.meta.env.VITE_SITE_ORIGIN as string | undefined);
  if (!origin) {
    throw new Error("Cannot build OAuth redirect URL: window.origin missing and VITE_SITE_ORIGIN unset.");
  }
  return `${origin.replace(/\/$/, "")}/auth/callback`;
}

export async function signInWithOAuthProvider(provider: OAuthProviderId, returnPath: string): Promise<void> {
  stashOAuthReturnPath(returnPath);
  const redirectTo = getAuthCallbackUrl();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: false,
    },
  });
  if (error) throw error;
}
