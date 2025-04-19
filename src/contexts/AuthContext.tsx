import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, firestore, googleProvider } from "@/lib/firebase";
import { AuthContextType, User } from "@/types/auth";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { EMOJI_OPTIONS } from "@/constants/emoji-constants";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const createUserDocument = async (firebaseUser: any, additionalData = {}) => {
    if (!firebaseUser) return null;
    
    const userRef = doc(firestore, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const { email, displayName, photoURL } = firebaseUser;
      const createdAt = new Date();
      const randomEmoji = EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)];
      
      try {
        const userData = {
          email,
          displayName: displayName,
          emojiAvatar: randomEmoji,
          photoURL: photoURL || null,
          createdAt,
          cakeIds: [],
          ...additionalData
        };
        
        await setDoc(userRef, userData);
        
        console.log("User document created successfully!");
        return {
          id: firebaseUser.uid,
          email,
          displayName: displayName,
          emojiAvatar: randomEmoji,
          photoURL: photoURL || null,
          createdAt,
          cakeIds: []
        };
      } catch (error) {
        console.error("Error creating user document:", error);
        toast.error("Failed to create user profile. Please try again.");
        return null;
      }
    } else {
      const userData = userSnap.data();
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || userData.email,
        displayName: firebaseUser.displayName || userData.displayName,
        emojiAvatar: userData.emojiAvatar || "🍰",
        photoURL: firebaseUser.photoURL || userData.photoURL,
        createdAt: userData.createdAt,
        cakeIds: userData.cakeIds || []
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const userData = await createUserDocument(firebaseUser);
          
          if (userData) {
            setUser(userData);
            console.log("User authenticated:", userData);
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
      
      const userData = {
        displayName, 
        email, 
        emojiAvatar: emoji, 
        createdAt: new Date(),
        cakeIds: []
      };
      
      const userRef = doc(firestore, "users", result.user.uid);
      await setDoc(userRef, userData);
      
      setUser({
        id: result.user.uid,
        email,
        displayName,
        emojiAvatar: emoji,
        photoURL: null,
        createdAt: new Date(),
        cakeIds: []
      });
      
      toast.success("Account created successfully!");
      navigate('/profile');
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
      navigate('/profile');
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
      
      await createUserDocument(result.user);
      
      toast.success("Signed in with Google successfully!");
      navigate('/profile');
    } catch (err: any) {
      console.error("Error signing in with Google:", err);
      setError(err.message);
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.info("Signed out successfully.");
      navigate('/login');
    } catch (err: any) {
      console.error("Error signing out:", err);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const updateUserAvatar = async (emoji: string) => {
    if (!user) return;
    
    try {
      const userRef = doc(firestore, "users", user.id);
      await updateDoc(userRef, { emojiAvatar: emoji });
      
      setUser({
        ...user,
        emojiAvatar: emoji
      });
      
      toast.success("Avatar updated successfully!");
      return true;
    } catch (err) {
      console.error("Error updating avatar:", err);
      toast.error("Failed to update avatar. Please try again.");
      return false;
    }
  };

  const updateDisplayName = async (newName: string) => {
    if (!user || !auth.currentUser) return false;
    
    try {
      await updateProfile(auth.currentUser, {
        displayName: newName
      });
      
      const userRef = doc(firestore, "users", user.id);
      await updateDoc(userRef, { displayName: newName });
      
      setUser({
        ...user,
        displayName: newName
      });
      
      toast.success("Display name updated successfully!");
      return true;
    } catch (err) {
      console.error("Error updating display name:", err);
      toast.error("Failed to update display name. Please try again.");
      return false;
    }
  };

  const deleteAccount = async () => {
    if (!user || !auth.currentUser) return;
    
    try {
      const cakesQuery = query(collection(firestore, "cakes"), where("userId", "==", user.id));
      const cakesSnapshot = await getDocs(cakesQuery);
      
      const deletionPromises = cakesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletionPromises);
      
      await deleteDoc(doc(firestore, "users", user.id));
      
      await deleteUser(auth.currentUser);
      
      toast.success("Account deleted successfully.");
      navigate('/');
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    signOut,
    updateUserAvatar,
    updateDisplayName,
    deleteAccount,
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
