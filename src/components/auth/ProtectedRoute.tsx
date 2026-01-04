import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User role not authorized, redirect to home or unauthorized page
    // For now, redirecting to home which handles redirection to role-specific dashboards
    // or we could redirect to their specific dashboard based on their role
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Coach') return <Navigate to="/coach" replace />;
    if (user.role === 'Member') return <Navigate to="/member" replace />;
    
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
