
import React from "react";
import { Link } from "react-router-dom";
import AdminNavLinks from "./AdminNavLinks";
import UserProfileSection from "./UserProfileSection";
import { UserRole } from "@/types/auth";
import { User } from "@supabase/supabase-js";

interface AdminSidebarProps {
  user: User | null;
  userRole: UserRole | null;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, userRole, signOut, isAdmin }) => {
  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-900 text-white">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 px-4 border-b border-gray-800">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">FinalRound</span>
          </Link>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="flex-1 px-2 space-y-1">
            <AdminNavLinks userRole={userRole} />
          </nav>
        </div>
        <UserProfileSection 
          user={user} 
          userRole={userRole} 
          signOut={signOut} 
          variant="sidebar" 
        />
      </div>
    </div>
  );
};

export default AdminSidebar;
