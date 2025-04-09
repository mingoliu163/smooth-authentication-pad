
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/types/auth";

type EnhancedProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  email: string;
  approved: boolean;
  display_name: string;
};

const UserManagement = () => {
  const [users, setUsers] = useState<EnhancedProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUser, setEditingUser] = useState<EnhancedProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Use the Edge Function to get users with display names from auth.users
      const { data, error } = await supabase.functions.invoke('get-users-with-display-names');
      
      if (error) throw error;
      
      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = async () => {
    try {
      if (!editingUser) return;
      
      // Update user profile
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          role: editingUser.role,
          approved: editingUser.approved
        })
        .eq("id", editingUser.id);
      
      if (error) {
        throw error;
      }
      
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async () => {
    // Implementation for user deletion would go here
    // This requires admin API calls and should be handled with care
    setIsDeleteDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button>Add User</Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">All Users</h2>
            <p className="text-gray-500 mb-4">Manage user accounts, their roles, and approval status</p>
            
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.display_name}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${user.role === 'admin' ? 'bg-red-100 text-red-800' : ''} 
                            ${user.role === 'hr' ? 'bg-blue-100 text-blue-800' : ''} 
                            ${user.role === 'job_seeker' ? 'bg-green-100 text-green-800' : ''}
                          `}
                        >
                          {user.role === 'admin' ? 'Administrator' : 
                           user.role === 'hr' ? 'HR Professional' : 
                           'Job Seeker'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={user.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {user.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingUser(user);
                              setIsEditDialogOpen(true);
                            }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setEditingUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input 
                    value={editingUser.first_name || ''} 
                    onChange={e => setEditingUser({...editingUser, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input 
                    value={editingUser.last_name || ''} 
                    onChange={e => setEditingUser({...editingUser, last_name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={editingUser.email} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input value={editingUser.display_name} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={value => setEditingUser({...editingUser, role: value as UserRole})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="hr">HR Professional</SelectItem>
                    <SelectItem value="job_seeker">Job Seeker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={editingUser.approved} 
                  onCheckedChange={checked => setEditingUser({...editingUser, approved: checked})}
                />
                <label>Approved</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UserManagement;
