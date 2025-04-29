import { Timestamp } from "firebase/firestore";
import { CakePreview } from "@/types/cake.ts";

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

export type EntityCreator = {
  id: string;
  name: string;
  emoji: string;
};
