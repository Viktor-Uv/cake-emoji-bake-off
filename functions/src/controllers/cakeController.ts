import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { Cake } from '../types/cake';
import { handleCakeCreation } from '../services/cakeService';
import { logger } from "firebase-functions";

export const onCakeCreated = onDocumentCreated('cakes/{cakeId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error('No data associated with the event');
    return;
  }

  const cakeData = snapshot.data() as Cake;

  logger.info(`New cake created with ID: ${cakeData.id} by user: ${cakeData.createdBy.id}`);

  try {
    await handleCakeCreation(cakeData);
  } catch (error) {
    logger.error('Error in onCakeCreated trigger:', error);
  }
});
