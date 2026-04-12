import { AuthLoadingFallback } from "@/components/AuthLoadingFallback";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, user, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingFallback />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

