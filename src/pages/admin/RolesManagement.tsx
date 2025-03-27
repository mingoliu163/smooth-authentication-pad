
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Permission = {
  id: string;
  name: string;
  description: string;
  admin: boolean;
  hr: boolean;
  job_seeker: boolean;
};

// Predefined set of permissions for the app
const defaultPermissions: Permission[] = [
  {
    id: "view_dashboard",
    name: "View Dashboard",
    description: "Access to view the main dashboard",
    admin: true,
    hr: true,
    job_seeker: true,
  },
  {
    id: "manage_users",
    name: "Manage Users",
    description: "Create, edit, and delete user accounts",
    admin: true,
    hr: false,
    job_seeker: false,
  },
  {
    id: "manage_roles",
    name: "Manage Roles",
    description: "Assign and edit user roles and permissions",
    admin: true,
    hr: false,
    job_seeker: false,
  },
  {
    id: "manage_interviews",
    name: "Manage Interviews",
    description: "Create, edit, and review interview sessions",
    admin: true,
    hr: true,
    job_seeker: false,
  },
  {
    id: "post_jobs",
    name: "Post Jobs",
    description: "Create and edit job listings",
    admin: true,
    hr: true,
    job_seeker: false,
  },
  {
    id: "view_jobs",
    name: "View Jobs",
    description: "Browse available job listings",
    admin: true,
    hr: true,
    job_seeker: true,
  },
  {
    id: "apply_jobs",
    name: "Apply to Jobs",
    description: "Submit applications for job listings",
    admin: true,
    hr: false,
    job_seeker: true,
  },
  {
    id: "take_assessments",
    name: "Take Assessments",
    description: "Complete questionnaires and assessments",
    admin: true,
    hr: true,
    job_seeker: true,
  },
  {
    id: "ai_interview",
    name: "AI Interview",
    description: "Access to AI interview features",
    admin: true,
    hr: true,
    job_seeker: true,
  },
];

const RolesManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/");
      return;
    }

    // Load permissions (in a real app, these would come from your database)
    setPermissions(defaultPermissions);
  }, [isAdmin, navigate]);

  const handlePermissionChange = (
    permissionId: string,
    role: 'admin' | 'hr' | 'job_seeker',
    value: boolean
  ) => {
    setPermissions(
      permissions.map((permission) => {
        if (permission.id === permissionId) {
          // Special case: don't allow removing admin permissions from admin role
          if (role === 'admin' && permission.id === 'manage_users' && !value) {
            toast.error("Cannot remove core permissions from Administrator role");
            return permission;
          }
          
          return {
            ...permission,
            [role]: value,
          };
        }
        return permission;
      })
    );

    // In a real application, you would save these changes to your database
    toast.success(`Permission updated for ${role} role`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Role & Permission Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role-Based Permissions</CardTitle>
            <CardDescription>
              Configure what each role is allowed to do in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Permission</TableHead>
                    <TableHead className="w-[350px]">Description</TableHead>
                    <TableHead className="text-center">Administrator</TableHead>
                    <TableHead className="text-center">HR Professional</TableHead>
                    <TableHead className="text-center">Job Seeker</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        {permission.name}
                      </TableCell>
                      <TableCell>{permission.description}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={permission.admin}
                          onCheckedChange={(value) =>
                            handlePermissionChange(permission.id, "admin", value)
                          }
                          disabled={
                            permission.id === "manage_users" ||
                            permission.id === "manage_roles"
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={permission.hr}
                          onCheckedChange={(value) =>
                            handlePermissionChange(permission.id, "hr", value)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={permission.job_seeker}
                          onCheckedChange={(value) =>
                            handlePermissionChange(
                              permission.id,
                              "job_seeker",
                              value
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="mt-6 text-sm text-gray-500">
              <p>
                <strong>Note:</strong> Some core permissions for the Administrator
                role cannot be disabled for security reasons.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RolesManagement;
