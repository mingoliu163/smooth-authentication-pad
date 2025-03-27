
import React from "react";
import { AuthProvider } from "./AuthContext";
import { ProfileProvider } from "./ProfileContext";

// This provider combines both Auth and Profile contexts to maintain the same API structure
export function CombinedAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </AuthProvider>
  );
}
