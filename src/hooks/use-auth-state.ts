
import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { User } from '@/types/auth';
import { EMOJI_OPTIONS } from '@/utils/auth-utils';
import { toast } from '@/components/ui/sonner';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleUserData = async (firebaseUser: FirebaseUser) => {
    try {
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
        
        await setDoc(doc(firestore, "users", firebaseUser.uid), {
          displayName: firebaseUser.displayName || "Cake Baker",
          email: firebaseUser.email,
          emojiAvatar: "🍰",
          photoURL: firebaseUser.photoURL,
          createdAt: new Date()
        });
      }
    } catch (err) {
      console.error("Error handling user data:", err);
      toast.error("Error loading user data. Please try again.");
    }
  };

  useEffect(() => {
    return auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          await handleUserData(firebaseUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state error:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return { user, loading, error };
};

