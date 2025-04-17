
import React, { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthState } from "@/hooks/use-auth-state";
import { useAuthMethods } from "@/hooks/use-auth-methods";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: stateLoading, error: stateError } = useAuthState();
  const {
    signUp,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    loading: methodsLoading,
    error: methodsError
  } = useAuthMethods();

  const value = {
    user,
    loading: stateLoading || methodsLoading,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signUp,
    signOut,
    error: methodsError || stateError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

