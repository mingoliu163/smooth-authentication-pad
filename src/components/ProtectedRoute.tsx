
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type UserRole = 'admin' | 'hr' | 'job_seeker';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, userRole, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      console.log("No user logged in, redirecting to login");
      navigate("/login");
      return;
    }

    // Only check for access permission when allowedRoles are specified
    if (!loading && user && allowedRoles && !hasPermission(allowedRoles)) {
      console.log("Permission denied. User role:", userRole, "Required roles:", allowedRoles);
      // Redirect users to their appropriate dashboard based on role
      if (userRole === 'admin') {
        navigate("/admin");
      } else if (userRole === 'hr') {
        navigate("/hr");
      } else if (userRole === 'job_seeker') {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
      return;
    }
  }, [user, loading, navigate, userRole, allowedRoles, hasPermission]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check for role-based access if allowedRoles are specified
  if (user && allowedRoles && !hasPermission(allowedRoles)) {
    console.log("Permission denied. User role:", userRole, "Required roles:", allowedRoles);
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertDescription className="py-4">
            <p className="mb-4">You don't have permission to access this page.</p>
            <Button onClick={() => {
              if (userRole === 'admin') {
                navigate("/admin");
              } else if (userRole === 'hr') {
                navigate("/hr");
              } else {
                navigate("/dashboard");
              }
            }} variant="outline">
              Return to Dashboard
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
