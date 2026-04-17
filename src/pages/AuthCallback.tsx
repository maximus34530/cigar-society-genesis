import Layout from "@/components/Layout";
import { PageLoadingFallback } from "@/components/PageLoadingFallback";
import { Seo } from "@/components/Seo";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DEFAULT_POST_AUTH_PATH,
  resolvePostLoginPathForUser,
  takeOAuthReturnPath,
} from "@/lib/authRouting";
import { supabase } from "@/lib/supabase";

async function exchangeCodeIfPresent(): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return { ok: true };
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed to complete sign-in." };
  }
}

async function waitForUserSession(maxMs: number): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data.session?.user) return true;
    await new Promise((r) => setTimeout(r, 120));
  }
  return false;
}

/**
 * OAuth PKCE return target. Supabase redirects here with `?code=`; client exchanges for a session.
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const exchange = await exchangeCodeIfPresent();
      if (cancelled) return;
      if (!exchange.ok) {
        takeOAuthReturnPath();
        navigate("/login", { replace: true, state: { error: exchange.message } });
        return;
      }

      const ok = await waitForUserSession(8000);
      if (cancelled) return;

      if (!ok) {
        takeOAuthReturnPath();
        navigate("/login", { replace: true, state: { error: "OAuth sign-in did not complete. Please try again." } });
        return;
      }

      const from = takeOAuthReturnPath() ?? DEFAULT_POST_AUTH_PATH;
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (cancelled || !uid) {
        takeOAuthReturnPath();
        navigate("/login", { replace: true, state: { error: "Could not read your session. Please try again." } });
        return;
      }

      const destination = await resolvePostLoginPathForUser(from, uid);
      if (cancelled) return;
      navigate(destination, { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <Layout>
      <Seo title="Signing in" description="Completing sign-in." path="/auth/callback" noIndex />
      <section className="section-padding">
        <PageLoadingFallback />
      </section>
    </Layout>
  );
};

export default AuthCallback;
