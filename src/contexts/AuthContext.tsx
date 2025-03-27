
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      // Redirect will happen after onAuthStateChange updates the profile and userRole
      toast.success("Signed in successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, firstName?: string, lastName?: string, role: UserRole = 'job_seeker') {
    try {
      console.log("Signing up with:", email, firstName, lastName, role);
      setLoading(true);
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            first_name: firstName, 
            last_name: lastName, 
            role 
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
          role: role
        });
      
      if (profileError) {
        console.error("Error updating profile:", profileError);
        toast.error("Account created but profile setup failed");
      } else {
        console.log("Profile created/updated successfully for user:", authData.user.id);
      }
      
      navigate("/");
      toast.success("Account created successfully. Please check your email for verification.");
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
