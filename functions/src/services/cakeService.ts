import { Cake, CakePreview } from '../types/cake';
import {updateCreatedCakes, getUserById} from "../repositories/userRepository";
import { logger } from "firebase-functions";
import {User} from "../types/user";

export async function handleCakeCreation(cake: Cake): Promise<void> {
  const userId = cake.createdBy.id;

  const user: User | null = await getUserById(userId);
  if (!user) {
    logger.warn(`User with ID ${userId} not found`);
    throw new Error('User not found');
  }

  const userCreatedCakes: CakePreview[] = user.createdCakes;
  const cakeExists = userCreatedCakes.some(cakePreview => cakePreview.id === cake.id);
  if (cakeExists) {
    logger.warn(`Cake with ID ${cake.id} already exists for user ${userId}`);
    throw new Error('Cake already exists');
  }

  const cakePreview: CakePreview = getCakePreview(cake);
  userCreatedCakes.push(cakePreview);

  await updateCreatedCakes(userId, userCreatedCakes);
  logger.info(`Successfully updated user ${userId} with new cake ${cake.id}`);
}

function getCakePreview(cake: Cake): CakePreview {
  return {
    id: cake.id,
    title: cake.title,
    description: cake.description,
    images: cake.images,
    createdAt: cake.createdAt,
    ratingSummary: cake.ratingSummary
  };
}
