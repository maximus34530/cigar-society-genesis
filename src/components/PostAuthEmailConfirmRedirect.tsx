import { useAuth } from "@/hooks/useAuth";
import { resolvePostLoginPathForUser, takeEmailSignupReturnIfMatchesUser } from "@/lib/authRouting";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * After email confirmation, Supabase may establish a session on first load.
 * Consume the signup-time return path only when it matches the signed-in user's email.
 */
export function PostAuthEmailConfirmRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user?.id || !user.email) return;
    const path = takeEmailSignupReturnIfMatchesUser(user.email);
    if (!path) return;
    void (async () => {
      const destination = await resolvePostLoginPathForUser(path, user.id);
      navigate(destination, { replace: true });
    })();
  }, [loading, navigate, user?.email, user?.id]);

  return null;
}
