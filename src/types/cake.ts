
export interface CakeImage {
  id: string;
  url: string;
  isMain: boolean;
}

export interface CakeRating {
  userId: string;
  rating: number; // 1-5
  timestamp: Date;
  userName: string;
  userEmoji: string;
}

export interface Cake {
  id: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  userEmoji: string;
  images: CakeImage[];
  createdAt: Date;
  ratings: CakeRating[];
  averageRating: number;
}
