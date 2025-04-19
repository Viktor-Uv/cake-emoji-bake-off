
export interface User {
  id: string;
  email: string;
  displayName: string;
  emojiAvatar: string;
  photoURL?: string;
  createdAt?: Date;
  cakeIds?: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, emoji: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserAvatar: (emoji: string) => Promise<boolean>;
  error: string | null;
}
