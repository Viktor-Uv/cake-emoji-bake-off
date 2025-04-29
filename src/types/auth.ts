import {User} from "@/types/user.ts";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, emoji: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserAvatar: (emoji: string) => Promise<boolean>;
  updateDisplayName: (newName: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
  updateLanguagePreference: (language: string) => Promise<boolean>;
  error: string | null;
}
