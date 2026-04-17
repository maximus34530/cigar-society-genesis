import { useAuth } from "@/hooks/useAuth";
import { peekOAuthReturnPath, takeOAuthReturnPath } from "@/lib/authRouting";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * If OAuth completed on a route that never ran {@link AuthCallback} (e.g. Site URL = `/`),
 * session exists but the post-auth path is still in sessionStorage. Send the user to the
 * intended URL (e.g. `/events?checkout_resume=1` for ticket checkout).
 */
export function OAuthReturnCatchUp() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    didRun.current = false;
  }, [user?.id]);

  useEffect(() => {
    if (loading || !user) return;
    if (location.pathname === "/auth/callback") return;
    if (didRun.current) return;

    const pending = peekOAuthReturnPath();
    if (!pending || !pending.startsWith("/events")) return;

    const here = `${location.pathname}${location.search}`;
    if (here === pending) {
      takeOAuthReturnPath();
      return;
    }

    const onRescueRoute =
      location.pathname === "/" ||
      location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname === "/dashboard";
    const strayEventsList =
      location.pathname === "/events" &&
      pending.includes("checkout_resume") &&
      !location.search.includes("checkout_resume");
    if (!onRescueRoute && !strayEventsList) return;

    didRun.current = true;
    takeOAuthReturnPath();
    navigate(pending, { replace: true });
  }, [loading, user?.id, location.pathname, location.search, navigate]);

  return null;
}
