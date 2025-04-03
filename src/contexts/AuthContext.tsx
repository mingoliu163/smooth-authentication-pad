import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, UserRole } from "@/types/auth";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      
      // First perform the sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (signInError) {
        toast.error(signInError.message);
        return;
      }
      
      // Get the current session to access the user
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      
      if (!currentUser) {
        toast.error("Failed to get user information");
        return;
      }
      
      // Check if the user is approved or a job seeker
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role, approved")
        .eq("id", currentUser.id)
        .single();
      
      if (profileError) {
        toast.error("Could not verify account status");
        await supabase.auth.signOut();
        return;
      }
      
      // Only newly registered HR professionals need approval
      // Administrators and job seekers can always log in
      if (profileData && profileData.role === 'hr' && !profileData.approved) {
        toast.error("Your account requires admin approval before you can log in");
        await supabase.auth.signOut();
        return;
      }
      
      // If we got here, the sign-in is successful
      toast.success("Signed in successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign in");
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, firstName?: string, lastName?: string, role: UserRole = 'job_seeker', displayName?: string) {
    try {
      console.log("Signing up with:", email, firstName, lastName, role, displayName);
      setLoading(true);
      
      // Only job seekers are automatically approved
      // HR and admin accounts need approval
      const autoApprove = role === 'job_seeker';
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            first_name: firstName, 
            last_name: lastName, 
            role,
            name: displayName // Add the displayName to auth metadata
          }
        }
      });
      
      if (authError) {
        console.error("Auth error during signup:", authError);
        toast.error(authError.message);
        return;
      }
      
      if (!authData.user) {
        console.error("No user returned from signup");
        toast.error("Failed to create user account");
        return;
      }
      
      console.log("Auth signup successful:", authData.user.id);
      
      // Manually create/update the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          first_name: firstName || null,
          last_name: lastName || null,
          role: role,
          approved: autoApprove // Only job seekers are auto-approved
        });
      
      if (profileError) {
        console.error("Error updating profile:", profileError);
        toast.error("Account created but profile setup failed");
      } else {
        console.log("Profile created/updated successfully for user:", authData.user.id);
      }
      
      navigate("/");
      
      if (role === 'hr' || role === 'admin') {
        toast.success("Account created successfully. An admin must approve your account before you can log in.");
      } else {
        toast.success("Account created successfully. Please check your email for verification.");
      }
    } catch (error: any) {
      console.error("Error during signup:", error);
      toast.error(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign out");
    } finally {
      setLoading(false);
    }
  }

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
