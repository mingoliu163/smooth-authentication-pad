
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  LayoutDashboard,
  Menu,
  ChevronLeft,
  LogOut,
  BriefcaseBusiness,
  Calendar,
  Book,
  FileText
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut, isAdmin, isHR, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  // Check if user has appropriate role
  React.useEffect(() => {
    if (!isAdmin() && !isHR()) {
      navigate("/");
    }
  }, [isAdmin, isHR, navigate]);

  const adminLinks = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ['admin'],
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      roles: ['admin'],
    },
    {
      name: "Permissions",
      href: "/admin/roles",
      icon: <Shield className="h-5 w-5" />,
      roles: ['admin'],
    },
  ];

  const hrLinks = [
    {
      name: "HR Dashboard",
      href: "/hr",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ['admin', 'hr'],
    },
    {
      name: "Jobs",
      href: "/hr/jobs",
      icon: <BriefcaseBusiness className="h-5 w-5" />,
      roles: ['admin', 'hr'],
    },
    {
      name: "Interviews",
      href: "/hr/interviews",
      icon: <Calendar className="h-5 w-5" />,
      roles: ['admin', 'hr'],
    },
    {
      name: "Assessments",
      href: "/hr/assessments",
      icon: <FileText className="h-5 w-5" />,
      roles: ['admin', 'hr'],
    },
    {
      name: "Exam Bank",
      href: "/hr/exams",
      icon: <Book className="h-5 w-5" />,
      roles: ['admin', 'hr'],
    },
  ];

  // Combine links based on user role
  const navLinks = isAdmin() 
    ? [...adminLinks, ...hrLinks]
    : hrLinks;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const dashboardTitle = isAdmin() ? "Admin Dashboard" : "HR Dashboard";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-900 text-white">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 px-4 border-b border-gray-800">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">FinalRound</span>
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 px-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    isActive(link.href)
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {link.icon}
                  <span className="ml-3">{link.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.email}</p>
                <p className="text-xs text-gray-300">{userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || 'User'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-4 w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
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
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    isActive(link.href)
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.icon}
                  <span className="ml-3">{link.name}</span>
                </Link>
              ))}
              <Button
                variant="ghost"
                className="justify-start text-gray-300 hover:text-white hover:bg-gray-700 mt-4"
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="ml-4 flex-1 flex justify-center md:justify-start">
          <Link to="/" className="text-lg font-bold">
            FinalRound {isAdmin() ? "Admin" : "HR"}
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:ml-64">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
