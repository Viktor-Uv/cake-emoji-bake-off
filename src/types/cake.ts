import { Timestamp } from 'firebase/firestore';
import { EntityCreator } from "./user";

export interface CakeImage {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  thumbnailPath: string | null;
}

export interface CakeRating {
  userId: string;
  rating: number; // 1-5
  timestamp: Timestamp;
}

export interface Cake {
  id: string;
  title: string;
  description: string;
  createdBy: EntityCreator;
  images: CakeImage[];
  createdAt: Timestamp;
  ratings: CakeRating[];
  ratingSummary: RatingSummary;
}

export type CakePreview = Omit<Cake, 'createdBy' | 'ratings'>;

export type RatingSummary = {
  count: number;
  average: number;
};
