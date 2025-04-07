
import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import AdminNavLinks from "./AdminNavLinks";
import UserProfileSection from "./UserProfileSection";
import { UserRole } from "@/types/auth";
import { User } from "@supabase/supabase-js";

interface AdminMobileMenuProps {
  user: User | null;
  userRole: UserRole | null;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
}

const AdminMobileMenu: React.FC<AdminMobileMenuProps> = ({ user, userRole, signOut, isAdmin }) => {
  const [open, setOpen] = React.useState(false);
  
  const dashboardTitle = isAdmin() ? "Admin Dashboard" : "HR Dashboard";

  return (
    <div className="md:hidden flex items-center h-16 px-4 border-b border-gray-200 sticky top-0 bg-white z-10">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-gray-900 text-white">
          <div className="flex items-center mb-8">
            <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
              <span className="text-xl font-bold">FinalRound</span>
            </Link>
          </div>
          <nav className="flex flex-col space-y-1">
            <AdminNavLinks userRole={userRole} onNavigate={() => setOpen(false)} />
            <UserProfileSection 
              user={user} 
              userRole={userRole} 
              signOut={signOut} 
              onClose={() => setOpen(false)} 
              variant="mobile" 
            />
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-4 flex-1 flex justify-center md:justify-start">
        <Link to="/" className="text-lg font-bold">
          FinalRound {isAdmin() ? "Admin" : "HR"}
        </Link>
      </div>
    </div>
  );
};

export default AdminMobileMenu;
