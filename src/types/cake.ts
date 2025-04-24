import { Timestamp } from 'firebase/firestore';

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
  userName: string;
  userEmoji: string;
}

export interface Cake {
  id: string;
  title: string;
  description: string;
  createdBy: {
    id: string;
    name: string;
    emoji: string;
  };
  images: CakeImage[];
  createdAt: Timestamp;
  ratings: CakeRating[];
  averageRating: number;
}

export type CakePreview = Pick<Cake, 'id' | 'title' | 'description' | 'images' | 'averageRating'>;
