
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileMenu from "@/components/admin/AdminMobileMenu";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut, isAdmin, isHR, userRole } = useAuth();
  const navigate = useNavigate();

  // Check if user has appropriate role
  React.useEffect(() => {
    if (!isAdmin() && !isHR()) {
      navigate("/");
    }
  }, [isAdmin, isHR, navigate]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <AdminSidebar 
        user={user} 
        userRole={userRole} 
        signOut={signOut} 
        isAdmin={isAdmin} 
      />

      {/* Mobile menu and main content */}
      <div className="flex flex-col flex-1 md:ml-64">
        <AdminMobileMenu 
          user={user} 
          userRole={userRole} 
          signOut={signOut} 
          isAdmin={isAdmin} 
        />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
