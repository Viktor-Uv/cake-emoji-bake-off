import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  deleteDoc, 
  where,
  serverTimestamp 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { firestore, storage } from "@/lib/firebase";
import { Cake, CakeImage, CakeRating } from "@/types/cake";
import { User } from "@/types/auth";

// Create a new cake
export async function createCake(
  title: string, 
  description: string | undefined, // Make description optional
  images: File[], 
  mainImageIndex: number,
  currentUser: User
): Promise<string> {
  try {
    // First, upload all images to Firebase Storage
    const uploadedImages: CakeImage[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const isMain = i === mainImageIndex;
      
      // Create a unique path for each image
      const imagePath = `cakes/${currentUser.id}/${Date.now()}_${i}_${image.name}`;
      const imageRef = ref(storage, imagePath);
      
      // Upload the image
      await uploadBytes(imageRef, image);
      
      // Get the download URL
      const url = await getDownloadURL(imageRef);
      
      // Add to our array
      uploadedImages.push({
        id: imagePath, // Use the storage path as the ID for easy deletion later
        url,
        isMain
      });
    }
    
    // Now, create the cake document in Firestore
    const cakeData = {
      title,
      description: description || "", // Default to empty string if no description
      userId: currentUser.id,
      userName: currentUser.displayName || "Anonymous Baker",
      userEmoji: currentUser.emojiAvatar,
      images: uploadedImages,
      createdAt: serverTimestamp(),
      ratings: [],
      averageRating: 0
    };
    
    const cakeRef = await addDoc(collection(firestore, "cakes"), cakeData);
    
    return cakeRef.id;
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
  mainImageIndex?: number,
): Promise<void> {
  try {
    const cakeRef = doc(firestore, "cakes", cakeId);
    const cakeDoc = await getDoc(cakeRef);
    
    if (!cakeDoc.exists()) {
      throw new Error("Cake not found");
    }
    
    const updateData: any = {
      title,
      description: description || "", // Default to empty string if no description
    };
    
    // If new images were provided, handle them
    if (newImages && newImages.length > 0) {
      const uploadedImages: CakeImage[] = [];
      
      // First, delete all existing images from storage
      const existingImages = cakeDoc.data().images || [];
      for (const image of existingImages) {
        const imageRef = ref(storage, image.id);
        await deleteObject(imageRef);
      }
      
      // Upload new images
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        const isMain = i === (mainImageIndex || 0);
        
        const imagePath = `cakes/${cakeDoc.data().userId}/${Date.now()}_${i}_${image.name}`;
        const imageRef = ref(storage, imagePath);
        
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        
        uploadedImages.push({
          id: imagePath,
          url,
          isMain
        });
      }
      
      updateData.images = uploadedImages;
    }
    
    await updateDoc(cakeRef, updateData);
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
      orderBy("createdAt", "desc")
    );
    
    const cakeSnapshot = await getDocs(cakesQuery);
    
    return cakeSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        ratings: data.ratings || [],
        averageRating: data.averageRating || 0
      } as Cake;
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
      orderBy("averageRating", "desc"),
      // Only include cakes with at least one rating
      where("averageRating", ">", 0)
    );
    
    const cakeSnapshot = await getDocs(cakesQuery);
    
    return cakeSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        ratings: data.ratings || [],
        averageRating: data.averageRating || 0
      } as Cake;
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
  currentUser: User
): Promise<void> {
  try {
    // Get the cake document
    const cakeRef = doc(firestore, "cakes", cakeId);
    const cakeDoc = await getDoc(cakeRef);
    
    if (!cakeDoc.exists()) {
      throw new Error("Cake not found");
    }
    
    const cakeData = cakeDoc.data();
    const ratings = cakeData.ratings || [];
    
    // Check if user already rated this cake
    const userRatingIndex = ratings.findIndex(
      (r: CakeRating) => r.userId === currentUser.id
    );
    
    let newRatings = [...ratings];
    
    if (userRatingIndex >= 0) {
      // Update existing rating
      newRatings[userRatingIndex] = {
        userId: currentUser.id,
        rating,
        timestamp: new Date(),
        userName: currentUser.displayName || "Anonymous Baker",
        userEmoji: currentUser.emojiAvatar
      };
    } else {
      // Add new rating
      newRatings.push({
        userId: currentUser.id,
        rating,
        timestamp: new Date(),
        userName: currentUser.displayName || "Anonymous Baker",
        userEmoji: currentUser.emojiAvatar
      });
    }
    
    // Calculate the new average rating
    const sum = newRatings.reduce(
      (total: number, r: CakeRating) => total + r.rating, 
      0
    );
    const averageRating = sum / newRatings.length;
    
    // Update the cake document
    await updateDoc(cakeRef, {
      ratings: newRatings,
      averageRating
    });
  } catch (error) {
    console.error("Error rating cake:", error);
    throw new Error("Failed to rate cake. Please try again.");
  }
}

// Delete a cake
export async function deleteCake(cakeId: string): Promise<void> {
  try {
    // Get the cake document
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
      await deleteObject(imageRef);
    }
    
    // Delete the cake document from Firestore
    await deleteDoc(cakeRef);
  } catch (error) {
    console.error("Error deleting cake:", error);
    throw new Error("Failed to delete cake. Please try again.");
  }
}
