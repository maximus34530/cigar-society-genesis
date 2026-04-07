import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, user, isAdmin } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/profile" replace />;
  return <>{children}</>;
}

