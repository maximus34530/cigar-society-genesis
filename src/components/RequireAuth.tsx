import { AuthLoadingFallback } from "@/components/AuthLoadingFallback";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingFallback />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

