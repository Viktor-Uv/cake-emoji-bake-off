import { Timestamp } from 'firebase-admin/firestore';
import { CakePreview } from './cake';

export interface User {
  id: string;
  email: string;
  displayName: string;
  emojiAvatar: string;
  photoURL: string | null;
  createdAt: Timestamp;
  createdCakes: CakePreview[];
  languagePreference: string;
}
