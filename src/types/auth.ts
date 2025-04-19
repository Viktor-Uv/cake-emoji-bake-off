import {Timestamp} from "firebase/firestore";

export interface User {
  id: string;
  email: string;
  displayName: string;
  emojiAvatar: string;
  photoURL: string | null;
  createdAt: Timestamp;
  cakeIds: string[];
}

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
  error: string | null;
}
