import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, firestore, googleProvider, appleProvider } from "@/lib/firebase";
import { AuthContextType, User } from "@/types/auth";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { EMOJI_OPTIONS } from "@/constants/emoji-constants";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || userData.displayName,
              emojiAvatar: userData.emojiAvatar || "🍰",
              photoURL: firebaseUser.photoURL || undefined
            });
          } else {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName,
              emojiAvatar: "🍰",
              photoURL: firebaseUser.photoURL || undefined
            });
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Error loading user data. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string, emoji: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(result.user, {
        displayName: displayName
      });
      
      await setDoc(doc(firestore, "users", result.user.uid), {
        displayName,
        email,
        emojiAvatar: emoji,
        createdAt: new Date()
      });
      
      toast.success("Account created successfully!");
    } catch (err: any) {
      console.error("Error signing up:", err);
      setError(err.message);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed in successfully!");
    } catch (err: any) {
      console.error("Error signing in with email:", err);
      setError(err.message);
      toast.error("Failed to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      
      const userDoc = await getDoc(doc(firestore, "users", result.user.uid));
      
      if (!userDoc.exists()) {
        const randomEmoji = EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)];
        
        await setDoc(doc(firestore, "users", result.user.uid), {
          displayName: result.user.displayName,
          email: result.user.email,
          emojiAvatar: randomEmoji,
          photoURL: result.user.photoURL,
          createdAt: new Date()
        });
      }
      
      toast.success("Signed in with Google successfully!");
    } catch (err: any) {
      console.error("Error signing in with Google:", err);
      setError(err.message);
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    if (isMobile) {
      toast.error("Apple Sign In is currently only available on web. Please use email or Google login.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, appleProvider);
      
      const userDoc = await getDoc(doc(firestore, "users", result.user.uid));
      
      if (!userDoc.exists()) {
        const randomEmoji = EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)];
        
        await setDoc(doc(firestore, "users", result.user.uid), {
          displayName: result.user.displayName || "Cake Baker",
          email: result.user.email,
          emojiAvatar: randomEmoji,
          photoURL: result.user.photoURL,
          createdAt: new Date()
        });
      }
      
      toast.success("Signed in with Apple successfully!");
    } catch (err: any) {
      console.error("Error signing in with Apple:", err);
      setError(err.message);
      toast.error("Failed to sign in with Apple. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.info("Signed out successfully.");
    } catch (err: any) {
      console.error("Error signing out:", err);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signUp,
    signOut,
    error
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
