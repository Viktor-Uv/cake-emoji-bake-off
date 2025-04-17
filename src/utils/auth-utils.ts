
import { AuthError } from "firebase/auth";

export const EMOJI_OPTIONS = ["🍰", "🧁", "🎂", "🥮", "🍮", "🍭", "🍬", "🍫", "🍪", "🍩"];

export const formatFirebaseError = (error: AuthError | any): string => {
  const errorCode = error.code || '';
  
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

