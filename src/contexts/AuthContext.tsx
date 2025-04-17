
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
import { auth, firestore, googleProvider, appleProvider, testFirebaseConnection } from "@/lib/firebase";
import { AuthContextType, User } from "@/types/auth";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";

// Default emoji options for avatars
export const EMOJI_OPTIONS = ["🍰", "🧁", "🎂", "🥮", "🍮", "🍭", "🍬", "🍫", "🍪", "🍩"];

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const isMobile = useIsMobile();

  // Check Firebase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await testFirebaseConnection();
        setConnectionChecked(true);
      } catch (err) {
        console.error("Firebase connection check failed:", err);
        toast.error("Could not connect to Firebase. Please check your configuration.");
        setConnectionChecked(true);
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    if (!connectionChecked) return;
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          // User is signed in
          const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            // If we have additional user data in Firestore
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || userData.displayName,
              emojiAvatar: userData.emojiAvatar || "🍰",
              photoURL: firebaseUser.photoURL || undefined
            });
          } else {
            // If we only have the Firebase auth user data
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName,
              emojiAvatar: "🍰", // Default emoji
              photoURL: firebaseUser.photoURL || undefined
            });
            
            // Create a user document if it doesn't exist
            try {
              await setDoc(doc(firestore, "users", firebaseUser.uid), {
                displayName: firebaseUser.displayName || "Cake Baker",
                email: firebaseUser.email,
                emojiAvatar: "🍰",
                photoURL: firebaseUser.photoURL,
                createdAt: new Date()
              });
            } catch (err) {
              console.error("Error creating user document:", err);
            }
          }
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Error loading user data. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [connectionChecked]);

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string, emoji: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(result.user, {
        displayName: displayName
      });
      
      // Store additional user data in Firestore
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
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
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
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user exists in Firestore, if not create a new user document
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
      setError(formatFirebaseError(err));
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    if (isMobile) {
      toast.error("Apple Sign In is currently only available on web. Please use email or Google login.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, appleProvider);
      
      // Check if user exists in Firestore, if not create a new user document
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
      setError(formatFirebaseError(err));
      toast.error("Failed to sign in with Apple. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format Firebase error messages to be more user-friendly
  const formatFirebaseError = (error: any): string => {
    const errorCode = error.code || '';
    
    // Handle common Firebase auth errors
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already in use. Please try logging in or use another email.';
      case 'auth/invalid-email':
        return 'Invalid email format. Please check your email address.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please register first.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';
      case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
        return 'Invalid Firebase API key. Please check your Firebase configuration.';
      default:
        return error.message || 'An unknown error occurred. Please try again.';
    }
  };

  // Sign out
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
