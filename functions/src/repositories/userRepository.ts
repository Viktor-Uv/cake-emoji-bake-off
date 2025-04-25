import { User } from '../types/user';
import { db } from '../config/firebase';
import {CakePreview} from "../types/cake";

const usersCollection = db.collection('users');

export async function getUserById(userId: string): Promise<User | null> {
  const userDoc = await usersCollection.doc(userId).get();

  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data() as User;
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  await usersCollection.doc(userId).update(data);
}

export async function updateCreatedCakes(userId: string, createdCakes: CakePreview[]) {
  await updateUser(userId, { createdCakes });
}
