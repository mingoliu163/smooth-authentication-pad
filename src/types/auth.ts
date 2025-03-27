
import { Session, User } from "@supabase/supabase-js";

export type UserRole = 'admin' | 'hr' | 'job_seeker';

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
};

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
};

export type ProfileContextType = {
  profile: Profile | null;
  userRole: UserRole | null;
  loading: boolean;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  isAdmin: () => boolean;
  isHR: () => boolean;
  isJobSeeker: () => boolean;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
};
