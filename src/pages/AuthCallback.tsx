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
      const ok = await waitForUserSession(8000);
      if (cancelled) return;

      if (!ok) {
        takeOAuthReturnPath();
        navigate("/login", { replace: true });
        return;
      }

      const from = takeOAuthReturnPath() ?? DEFAULT_POST_AUTH_PATH;
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (cancelled || !uid) {
        takeOAuthReturnPath();
        navigate("/login", { replace: true });
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
