
import React, { useState, useRef, ChangeEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface ImageUploaderProps {
  onImagesSelected: (images: File[], mainImageIndex: number) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesSelected,
  maxImages = 5,
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (!files.length) return;
    
    // Check if adding these images would exceed the maximum
    if (selectedImages.length + files.length > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images`);
      return;
    }
    
    // Validate file types
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`${file.name} is not a valid image file`);
      }
      return isValid;
    });
    
    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedImages([...selectedImages, ...validFiles]);
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    
    // If this is the first image, set it as the main image
    if (selectedImages.length === 0 && validFiles.length > 0) {
      setMainImageIndex(0);
      
      // Notify parent component of selection
      onImagesSelected([...validFiles], 0);
    } else {
      // Notify parent component of selection
      onImagesSelected([...selectedImages, ...validFiles], mainImageIndex);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Create new arrays without the removed image
    const newImages = [...selectedImages];
    const newPreviewUrls = [...previewUrls];
    
    // Release the object URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setSelectedImages(newImages);
    setPreviewUrls(newPreviewUrls);
    
    // Update main image index if needed
    let newMainIndex = mainImageIndex;
    if (mainImageIndex === index) {
      // If the main image was removed, set the first image as main
      newMainIndex = newImages.length > 0 ? 0 : -1;
      setMainImageIndex(newMainIndex);
    } else if (mainImageIndex > index) {
      // If an image before the main image was removed, adjust the index
      newMainIndex = mainImageIndex - 1;
      setMainImageIndex(newMainIndex);
    }
    
    // Notify parent component of the change
    onImagesSelected(newImages, newMainIndex);
  };

  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
    
    // Notify parent component of the change
    onImagesSelected(selectedImages, index);
  };

  return (
    <div className="space-y-4">
      {/* Preview area */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          {previewUrls.map((url, index) => (
            <div 
              key={url} 
              className={`relative rounded-lg overflow-hidden border-2 ${
                index === mainImageIndex 
                  ? 'border-primary ring-2 ring-primary' 
                  : 'border-gray-200'
              }`}
            >
              <img 
                src={url} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-32 object-cover"
              />
              
              <div className="absolute top-0 right-0 p-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {index !== mainImageIndex && (
                <button
                  type="button"
                  onClick={() => setAsMainImage(index)}
                  className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs"
                >
                  Set as main photo
                </button>
              )}
              
              {index === mainImageIndex && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary bg-opacity-70 text-white p-1 text-xs text-center">
                  Main Photo
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Upload button */}
      {selectedImages.length < maxImages && (
        <div className="flex items-center justify-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            {selectedImages.length === 0 ? 'Upload Images' : 'Add More Images'}
          </Button>
        </div>
      )}
      
      <p className="text-sm text-gray-500 text-center">
        {selectedImages.length} / {maxImages} images
        {selectedImages.length > 0 && " (click to set main image)"}
      </p>
    </div>
  );
};

export default ImageUploader;
