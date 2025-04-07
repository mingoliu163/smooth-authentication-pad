
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, 
  Shield, 
  LayoutDashboard, 
  BriefcaseBusiness, 
  Calendar, 
  Book, 
  FileText 
} from "lucide-react";
import { UserRole } from "@/types/auth";

interface NavLink {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

interface AdminNavLinksProps {
  userRole: UserRole | null;
  onNavigate?: () => void;
}

const AdminNavLinks: React.FC<AdminNavLinksProps> = ({ userRole, onNavigate }) => {
  const location = useLocation();
  
  const adminLinks: NavLink[] = [
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

  const hrLinks: NavLink[] = [
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
  const navLinks = (userRole === 'admin') 
    ? [...adminLinks, ...hrLinks]
    : hrLinks;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.name}
          to={link.href}
          className={`flex items-center px-4 py-2 text-sm rounded-md ${
            isActive(link.href)
              ? "bg-gray-800 text-white"
              : "text-gray-300 hover:bg-gray-700"
          }`}
          onClick={onNavigate}
        >
          {link.icon}
          <span className="ml-3">{link.name}</span>
        </Link>
      ))}
    </>
  );
};

export default AdminNavLinks;
