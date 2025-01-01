import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      console.log("Initial auth state:", !!session);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      console.log("Auth state changed:", !!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show nothing while we check auth state
  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;