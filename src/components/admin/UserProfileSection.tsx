
import React from "react";
import { Link } from "react-router-dom";
import { UserRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/types/auth";

interface UserProfileSectionProps {
  user: User | null;
  userRole: UserRole | null;
  signOut: () => Promise<void>;
  onClose?: () => void;
  variant?: "sidebar" | "mobile";
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({ 
  user, userRole, signOut, onClose, variant = "sidebar" 
}) => {
  const handleSignOut = async () => {
    await signOut();
    if (onClose) onClose();
  };

  const displayRole = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User';

  if (variant === "sidebar") {
    return (
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="flex-1">
            <Link to="/profile" className="group flex items-center hover:bg-gray-800 p-2 rounded-md transition-colors">
              <UserRound className="h-5 w-5 text-gray-400 group-hover:text-gray-300 mr-2" />
              <div>
                <p className="text-sm font-medium text-white">{user?.email}</p>
                <p className="text-xs text-gray-300">{displayRole}</p>
              </div>
            </Link>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-4 w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    );
  }
  
  // Mobile variant
  return (
    <>
      <Link
        to="/profile"
        className="flex items-center px-4 py-3 mt-4 text-sm rounded-md bg-gray-800 text-white"
        onClick={onClose}
      >
        <UserRound className="h-4 w-4 mr-3" />
        <div>
          <p className="font-medium">{user?.email}</p>
          <p className="text-xs text-gray-300">{displayRole}</p>
        </div>
      </Link>
      <Button
        variant="ghost"
        className="justify-start text-gray-300 hover:text-white hover:bg-gray-700 mt-4"
        onClick={handleSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </>
  );
};

export default UserProfileSection;
