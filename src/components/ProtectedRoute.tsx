import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  children: ReactNode;
  requireRole?: "admin" | "guide";
};

export const ProtectedRoute = ({ children, requireRole }: Props) => {
  const { user, loading, isAdmin, isGuide } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (requireRole === "admin" && !isAdmin) return <Navigate to="/" replace />;
  if (requireRole === "guide" && !isGuide && !isAdmin) return <Navigate to="/become-guide" replace />;

  return <>{children}</>;
};
