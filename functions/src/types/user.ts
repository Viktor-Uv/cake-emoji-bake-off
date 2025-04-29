
import { Timestamp } from 'firebase-admin/firestore';
import { CakePreview } from './cake';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  emojiAvatar: string;
  photoURL: string | null;
  createdAt: Timestamp;
  createdCakes: CakePreview[];
  languagePreference: string;
  preferences: UserPreferences;
}

export type EntityCreator = {
  id: string;
  name: string;
  emoji: string;
};
