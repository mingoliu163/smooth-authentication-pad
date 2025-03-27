
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Briefcase,
  FileText,
  Shield,
  UserCheck,
} from "lucide-react";

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    hrUsers: 0,
    jobSeekers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/");
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Get user stats by role
        const { data, error } = await supabase
          .from("profiles")
          .select("role");

        if (error) {
          throw error;
        }

        // Calculate role counts
        const admins = data.filter((user) => user.role === "admin").length;
        const hrUsers = data.filter((user) => user.role === "hr").length;
        const jobSeekers = data.filter(
          (user) => user.role === "job_seeker"
        ).length;

        setStats({
          totalUsers: data.length,
          admins,
          hrUsers,
          jobSeekers,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, navigate]);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered accounts",
      icon: <Users className="h-5 w-5" />,
      color: "bg-blue-500",
    },
    {
      title: "Administrators",
      value: stats.admins,
      description: "System administrators",
      icon: <Shield className="h-5 w-5" />,
      color: "bg-red-500",
    },
    {
      title: "HR Professionals",
      value: stats.hrUsers,
      description: "HR staff members",
      icon: <UserCheck className="h-5 w-5" />,
      color: "bg-purple-500",
    },
    {
      title: "Job Seekers",
      value: stats.jobSeekers,
      description: "Active candidates",
      icon: <Briefcase className="h-5 w-5" />,
      color: "bg-green-500",
    },
  ];

  const quickLinks = [
    {
      title: "Manage Users",
      description: "Add, edit or remove user accounts",
      icon: <Users className="h-6 w-6" />,
      action: () => navigate("/admin/users"),
    },
    {
      title: "Manage Permissions",
      description: "Configure role-based access controls",
      icon: <Shield className="h-6 w-6" />,
      action: () => navigate("/admin/roles"),
    },
    {
      title: "HR Dashboard",
      description: "Go to HR management interface",
      icon: <UserCheck className="h-6 w-6" />,
      action: () => navigate("/hr"),
    },
    {
      title: "Job Listings",
      description: "View and manage job postings",
      icon: <Briefcase className="h-6 w-6" />,
      action: () => navigate("/jobs"),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">System Administration</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md font-medium">
                        {card.title}
                      </CardTitle>
                      <div
                        className={`${card.color} text-white p-2 rounded-full`}
                      >
                        {card.icon}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickLinks.map((link, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex flex-col items-center text-center" onClick={link.action}>
                        <div className="bg-primary/10 p-3 rounded-full mb-3">
                          {link.icon}
                        </div>
                        <h3 className="font-medium mb-1">{link.title}</h3>
                        <p className="text-sm text-gray-500">
                          {link.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
