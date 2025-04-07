
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { Profile, ProfileContextType, UserRole } from "@/types/auth";
import { toast } from "sonner";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  async function fetchProfile(userId: string) {
    try {
      console.log("Fetching profile for user:", userId);
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
        return;
      }

      console.log("Profile data:", data);
      setProfile(data as Profile);
      setUserRole(data.role || 'job_seeker');
      
      // Log role for debugging
      console.log("User role set to:", data.role || 'job_seeker');
      console.log("Approval status:", data.approved);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = () => userRole === 'admin';
  const isHR = () => userRole === 'hr';
  const isJobSeeker = () => userRole === 'job_seeker';
  
  const hasPermission = (requiredRoles: UserRole[]) => {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  };

  async function updateProfile(profileData: Partial<Profile>) {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      // Refresh profile data
      fetchProfile(user.id);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred while updating profile");
    }
  }

  async function uploadAvatar(file: File) {
    try {
      if (!user || !file) return null;
      
      // Create a unique file path for the avatar
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        toast.error(`Error uploading avatar: ${uploadError.message}`);
        return null;
      }
      
      // Get the public URL for the file
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (!data.publicUrl) {
        toast.error("Error getting public URL for avatar");
        return null;
      }
      
      // Update the profile with the new avatar URL
      await updateProfile({ avatar_url: data.publicUrl });
      toast.success("Avatar updated successfully");
      
      return data.publicUrl;
    } catch (error: any) {
      toast.error(error.message || "An error occurred while uploading avatar");
      return null;
    }
  }

  const value = {
    profile,
    userRole,
    loading,
    updateProfile,
    uploadAvatar,
    isAdmin,
    isHR,
    isJobSeeker,
    hasPermission
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
