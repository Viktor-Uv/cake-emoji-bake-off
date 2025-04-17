
import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore, googleProvider, appleProvider } from '@/lib/firebase';
import { formatFirebaseError } from '@/utils/auth-utils';
import { toast } from '@/components/ui/sonner';

export const useAuthMethods = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(formatFirebaseError(err));
      toast.error("Failed to create account. Please try again.");
      throw err;
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
      setError(formatFirebaseError(err));
      toast.error("Failed to sign in. Check your credentials.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      
      await setDoc(doc(firestore, "users", result.user.uid), {
        displayName: result.user.displayName,
        email: result.user.email,
        emojiAvatar: "🍰",
        photoURL: result.user.photoURL,
        createdAt: new Date()
      }, { merge: true });
      
      toast.success("Signed in with Google successfully!");
    } catch (err: any) {
      console.error("Error signing in with Google:", err);
      setError(formatFirebaseError(err));
      toast.error("Failed to sign in with Google. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, appleProvider);
      
      await setDoc(doc(firestore, "users", result.user.uid), {
        displayName: result.user.displayName || "Cake Baker",
        email: result.user.email,
        emojiAvatar: "🍰",
        photoURL: result.user.photoURL,
        createdAt: new Date()
      }, { merge: true });
      
      toast.success("Signed in with Apple successfully!");
    } catch (err: any) {
      console.error("Error signing in with Apple:", err);
      setError(formatFirebaseError(err));
      toast.error("Failed to sign in with Apple. Please try again.");
      throw err;
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
      throw err;
    }
  };

  return {
    signUp,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    loading,
    error
  };
};

