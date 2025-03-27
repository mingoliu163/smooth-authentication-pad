
import { useAuth as useBaseAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { AuthContextType, ProfileContextType } from "@/types/auth";

// This hook combines both Auth and Profile context data to maintain the same API
export function useAuth(): AuthContextType & ProfileContextType {
  const auth = useBaseAuth();
  const profile = useProfile();
  
  return {
    ...auth,
    ...profile
  };
}
