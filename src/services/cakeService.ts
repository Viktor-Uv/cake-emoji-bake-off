import {
  collection,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  deleteDoc,
  Timestamp, setDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {firestore, storage} from "@/lib/firebase";
import {Cake, CakeImage, CakeRating, CakePreview, RatingSummary} from "@/types/cake";
import {User} from "@/types/user";
import {processImage} from "@/utils/imageProcessor";

const cakesCollection = collection(firestore, "cakes");

// Create a new cake
export async function createCake(
  title: string,
  description: string | null, // Make description optional
  images: File[],
  mainImageIndex: number,
  currentUser: User,
): Promise<string> {
  try {
    const cakeRef = doc(cakesCollection);
    const newCakeId = cakeRef.id;

    // Upload all images to Firebase Storage
    const uploadedImages: CakeImage[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const isMain = i === mainImageIndex;

      // Process image to webp format
      const {mainImage, thumbnail} = await processImage(image);

      // Create a unique path for each image
      const imagePath = `cakes/${newCakeId}/${Date.now()}_${i}_${mainImage.name}`;
      const imageRef = ref(storage, imagePath);

      // Upload the main image
      await uploadBytes(imageRef, mainImage);

      // Get the download URL
      const url = await getDownloadURL(imageRef);

      // Handle thumbnail if available
      let thumbnailUrl: string | null = null;
      let thumbnailPath: string | null = null;

      if (thumbnail) {
        thumbnailPath = `cakes/${newCakeId}/${Date.now()}_${i}_${thumbnail.name}`;
        const thumbnailRef = ref(storage, thumbnailPath);

        // Upload the thumbnail
        await uploadBytes(thumbnailRef, thumbnail);
        thumbnailUrl = await getDownloadURL(thumbnailRef);
      }

      // Add to our array
      uploadedImages.push({
        id: imagePath, // Use the storage path as the ID for easy deletion later
        url,
        thumbnailUrl,
        thumbnailPath,
      });
    }

    const cakeData: Cake = {
      id: newCakeId,
      title,
      description: description || "",
      createdBy: {
        id: currentUser.id,
        name: currentUser.displayName,
        emoji: currentUser.emojiAvatar,
      },
      images: uploadedImages,
      createdAt: Timestamp.now(),
      ratings: [],
      ratingSummary: {
        count: 0,
        average: 0
      }
    };

    await setDoc(cakeRef, cakeData);

    return newCakeId;
  } catch (error) {
    console.error("Error creating cake:", error);
    throw new Error("Failed to create cake. Please try again.");
  }
}

// Update an existing cake
export async function updateCake(
  cakeId: string,
  title: string,
  description: string | undefined,
  newImages?: File[],
  existingImages?: CakeImage[],
): Promise<CakePreview> {
  try {
    const cakeRef = doc(firestore, "cakes", cakeId);
    const cakeDoc = await getDoc(cakeRef);

    if (!cakeDoc.exists()) {
      throw new Error("Cake not found");
    }

    const cake = cakeDoc.data() as Cake;

    const updateData: any = {
      title,
      description: description || "", // Default to empty string if no description
    };

    // Get all current images from the document
    const currentImages = cake.images || [];

    // First, handle existing images
    let imagesToKeep: CakeImage[] = [];

    if (existingImages && existingImages.length > 0) {
      // Find images to delete (images in currentImages but not in existingImages)
      const existingImageIds = existingImages.map(img => img.id);
      const imagesToDelete = currentImages.filter(
        (img: CakeImage) => !existingImageIds.includes(img.id),
      );

      // Delete those images from storage
      for (const image of imagesToDelete) {
        const imageRef = ref(storage, image.id);
        try {
          await deleteObject(imageRef);

          // Delete thumbnail if it exists
          if (image.thumbnailPath) {
            const thumbnailRef = ref(storage, image.thumbnailPath);
            await deleteObject(thumbnailRef);
          }
        } catch (error) {
          console.error("Error deleting image:", image.id, error);
          // Continue even if image deletion fails
        }
      }

      // Keep the images with their updated order and main status
      imagesToKeep = existingImages;
    }

    // If new images were provided, handle them
    if (newImages && newImages.length > 0) {
      const uploadedImages: CakeImage[] = [];

      // Upload new images
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];

        // Process image to webp format
        const {mainImage, thumbnail} = await processImage(image);

        const imagePath = `cakes/${cake.id}/${Date.now()}_${mainImage.name}`;
        const imageRef = ref(storage, imagePath);

        await uploadBytes(imageRef, mainImage);
        const url = await getDownloadURL(imageRef);

        // Handle thumbnail if available
        let thumbnailUrl: string | null = null;
        let thumbnailPath: string | null = null;

        if (thumbnail) {
          thumbnailPath = `cakes/${cake.id}/${Date.now()}_${thumbnail.name}`;
          const thumbnailRef = ref(storage, thumbnailPath);

          // Upload the thumbnail
          await uploadBytes(thumbnailRef, thumbnail);
          thumbnailUrl = await getDownloadURL(thumbnailRef);
        }

        uploadedImages.push({
          id: imagePath,
          url,
          thumbnailUrl,
          thumbnailPath,
        });
      }

      // Combine existing and new images
      updateData.images = [...imagesToKeep, ...uploadedImages];
    } else {
      // If no new images, just use the existing ones
      updateData.images = imagesToKeep;
    }

    // Ensure the first image is marked as main
    if (updateData.images && updateData.images.length > 0) {
      updateData.images = updateData.images.map((img: CakeImage, index: number) => ({
        ...img,
        isMain: index === 0, // First image is main
      }));
    }

    await updateDoc(cakeRef, updateData);
    
    // Return the updated cake preview for UI updates
    return {
      id: cakeId,
      title,
      description: description || "",
      images: updateData.images,
      createdAt: cake.createdAt,
      ratingSummary: {
        count: cake.ratingSummary.count || 0,
        average: cake.ratingSummary.average || 0
      }
    };
  } catch (error) {
    console.error("Error updating cake:", error);
    throw new Error("Failed to update cake. Please try again.");
  }
}

// Get all cakes sorted by creation date (newest first)
export async function getCakes(): Promise<Cake[]> {
  try {
    const cakesQuery = query(
      collection(firestore, "cakes"),
      orderBy("createdAt", "desc"),
    );

    const cakeSnapshot = await getDocs(cakesQuery);

    return cakeSnapshot.docs.map((doc) => {
      const data: Cake = doc.data() as Cake;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt,
        ratings: data.ratings || [],
        ratingSummary: {
          count: data.ratingSummary.count || 0,
          average: data.ratingSummary.average || 0
        }
      };
    });
  } catch (error) {
    console.error("Error fetching cakes:", error);
    throw new Error("Failed to fetch cakes. Please try again.");
  }
}

// Get cakes sorted by average rating (highest first)
export async function getCakesByRating(): Promise<Cake[]> {
  try {
    const cakesQuery = query(
      collection(firestore, "cakes"),
      orderBy("ratingSummary.average", "desc"),
    );

    const cakeSnapshot = await getDocs(cakesQuery);

    return cakeSnapshot.docs.map((doc) => {
      const data: Cake = doc.data() as Cake;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt,
        ratings: data.ratings || [],
        ratingSummary: {
          count: data.ratingSummary.count || 0,
          average: data.ratingSummary.average || 0
        }
      };
    });
  } catch (error) {
    console.error("Error fetching cakes by rating:", error);
    throw new Error("Failed to fetch rated cakes. Please try again.");
  }
}

// Rate a cake
export async function rateCake(
  cakeId: string,
  rating: number,
  currentUser: User,
): Promise<RatingSummary> {
  try {
    const cakeRef = doc(firestore, "cakes", cakeId);
    const cakeDoc = await getDoc(cakeRef);

    if (!cakeDoc.exists()) {
      throw new Error("Cake not found");
    }

    const cakeData = cakeDoc.data();
    const ratings = cakeData.ratings || [];

    // Check if user already rated this cake
    const userRatingIndex = ratings.findIndex(
      (r: CakeRating) => r.userId === currentUser.id,
    );

    const newRatings: CakeRating[] = [...ratings];

    if (userRatingIndex >= 0) {
      // Update existing rating
      newRatings[userRatingIndex] = {
        userId: currentUser.id,
        rating,
        timestamp: Timestamp.now()
      };
    } else {
      // Add new rating
      newRatings.push({
        userId: currentUser.id,
        rating,
        timestamp: Timestamp.now()
      });
    }

    // Calculate the new average rating
    const ratingSum = newRatings.reduce(
      (total: number, r: CakeRating) => total + r.rating,
      0,
    );
    const ratingCount = newRatings.length;
    const averageRating = ratingSum / ratingCount;
    const ratingSummary: RatingSummary = {
      count: ratingCount,
      average: averageRating
    };

    // Update the cake document
    await updateDoc(cakeRef, {
      ratings: newRatings,
      ratingSummary
    });
    
    // Return the new ratingSummary for immediate UI updates
    return ratingSummary;
  } catch (error) {
    console.error("Error rating cake:", error);
    throw new Error("Failed to rate cake. Please try again.");
  }
}

// Delete a cake
export async function deleteCake(cakeId: string): Promise<void> {
  try {
    const cakeRef = doc(firestore, "cakes", cakeId);
    const cakeDoc = await getDoc(cakeRef);

    if (!cakeDoc.exists()) {
      throw new Error("Cake not found");
    }

    const cakeData = cakeDoc.data();
    const images = cakeData.images || [];

    // Delete all images from Firebase Storage
    for (const image of images) {
      const imageRef = ref(storage, image.id);
      try {
        await deleteObject(imageRef);

        if (image.thumbnailPath) {
          const thumbnailRef = ref(storage, image.thumbnailPath);
          await deleteObject(thumbnailRef);
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
    // Delete the cake document from Firestore
    await deleteDoc(cakeRef);
  } catch (error) {
    console.error("Error deleting cake:", error);
    throw new Error("Failed to delete cake. Please try again.");
  }
}
