import { useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Supabase PKCE returns with `?code=` on whatever URL is configured as the OAuth redirect.
 * If that is the site root (or another route) instead of `/auth/callback`, move the exchange
 * onto the dedicated callback route so {@link AuthCallback} can read session + return path.
 */
export function SupabaseOAuthPathNormalizer() {
  const location = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has("code")) return;
    if (location.pathname === "/auth/callback") return;

    navigate(`/auth/callback${location.search}${location.hash}`, { replace: true });
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}
