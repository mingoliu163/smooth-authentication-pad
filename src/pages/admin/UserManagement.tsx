
// Modifying just the handleEditUser function in the UserManagement component
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
    
    // To update display name, we would need to update user metadata
    // This requires admin privileges and is typically done through Edge Functions
    // Here, we'll log this limitation
    console.log("Note: Display name updates require server-side functions");
    
    toast.success("User updated successfully");
    setIsEditDialogOpen(false);
    setEditingUser(null);
    fetchUsers();
  } catch (error: any) {
    console.error("Error updating user:", error);
    toast.error(error.message || "Failed to update user");
  }
};
