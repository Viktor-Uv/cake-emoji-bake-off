
/**
 * Utility for processing and optimizing images before upload
 */

// Maximum allowed file size (in bytes)
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const THUMBNAIL_THRESHOLD = 256 * 1024; // 256KB

/**
 * Converts an image file to webp format with resizing if needed
 * @param file Original image file
 * @returns A Promise that resolves to the processed file in webp format
 */
export async function processImage(file: File): Promise<{ 
  mainImage: File, 
  thumbnail: File | null 
}> {
  // Create a canvas element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }
  
  // Create an image element to draw to canvas
  const img = new Image();
  const imageUrl = URL.createObjectURL(file);
  
  try {
    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    // Calculate dimensions to maintain aspect ratio while reducing size if needed
    let width = img.width;
    let height = img.height;
    
    // Set canvas dimensions (potentially resizing to reduce file size)
    const MAX_DIMENSION = 2000; // Limit very large images
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw the image to canvas
    ctx.drawImage(img, 0, 0, width, height);
    
    // Convert to webp with compression
    let quality = 0.85; // Starting quality
    let blob: Blob | null = null;
    
    // Try with decreasing quality until we get under the size limit
    do {
      blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(result => resolve(result), 'image/webp', quality);
        quality -= 0.05; // Reduce quality for next iteration if needed
      });
      
      if (!blob || quality < 0.5) break; // Don't go below 50% quality
    } while (blob && blob.size > MAX_FILE_SIZE);
    
    if (!blob) {
      throw new Error("Failed to process image");
    }
    
    // Create the main image file
    const mainImage = new File([blob], `${file.name.split('.')[0]}.webp`, {
      type: 'image/webp',
      lastModified: new Date().getTime()
    });
    
    // Generate thumbnail if the image is large enough
    let thumbnail: File | null = null;
    if (blob.size > THUMBNAIL_THRESHOLD) {
      const thumbCanvas = document.createElement("canvas");
      const thumbCtx = thumbCanvas.getContext("2d");
      
      if (thumbCtx) {
        // Thumbnail dimensions - 300px on the longest side
        const THUMB_MAX = 300;
        let thumbWidth = width;
        let thumbHeight = height;
        
        if (thumbWidth > thumbHeight) {
          thumbHeight = Math.round((thumbHeight * THUMB_MAX) / thumbWidth);
          thumbWidth = THUMB_MAX;
        } else {
          thumbWidth = Math.round((thumbWidth * THUMB_MAX) / thumbHeight);
          thumbHeight = THUMB_MAX;
        }
        
        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;
        
        thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
        
        const thumbBlob = await new Promise<Blob | null>(resolve => {
          thumbCanvas.toBlob(result => resolve(result), 'image/webp', 0.7);
        });
        
        if (thumbBlob) {
          thumbnail = new File([thumbBlob], `${file.name.split('.')[0]}_thumb.webp`, {
            type: 'image/webp',
            lastModified: new Date().getTime()
          });
        }
      }
    }
    
    return { mainImage, thumbnail };
  } finally {
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
  }
}
