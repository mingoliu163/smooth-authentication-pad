
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import UserTable, { EnhancedProfile } from "@/components/admin/users/UserTable";
import EditUserDialog from "@/components/admin/users/EditUserDialog";
import DeleteUserDialog from "@/components/admin/users/DeleteUserDialog";
import AddUserDialog from "@/components/admin/users/AddUserDialog";
import { UserRole } from "@/types/auth";

const UserManagement = () => {
  const [users, setUsers] = useState<EnhancedProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUser, setEditingUser] = useState<EnhancedProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState<boolean>(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'job_seeker' as UserRole,
    approved: false,
    display_name: ''
  });

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

  const handleAddUser = async () => {
    try {
      // Create display name from first and last name
      const displayName = `${newUser.first_name} ${newUser.last_name}`.trim();
      
      console.log("Creating new user with data:", {
        ...newUser,
        displayName
      });
      
      // Call the Edge Function to create the user
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: newUser.email,
          password: newUser.password,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role,
          approved: newUser.approved,
          displayName
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("User created successfully");
      setIsAddUserDialogOpen(false);
      setNewUser({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'job_seeker',
        approved: false,
        display_name: ''
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    }
  };

  const handleEditClick = (user: EnhancedProfile) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (user: EnhancedProfile) => {
    setEditingUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button onClick={() => setIsAddUserDialogOpen(true)}>Add User</Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">All Users</h2>
            <p className="text-gray-500 mb-4">Manage user accounts, their roles, and approval status</p>
            
            <UserTable 
              users={users}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        user={editingUser}
        onSave={handleEditUser}
        setEditingUser={setEditingUser}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteUser}
      />

      {/* Add User Dialog */}
      <AddUserDialog
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        onAdd={handleAddUser}
        newUser={newUser}
        setNewUser={setNewUser}
      />
    </AdminLayout>
  );
};

export default UserManagement;
