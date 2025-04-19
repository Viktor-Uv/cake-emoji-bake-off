
import React, { useState, useRef, ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import DraggableImageGallery from "./DraggableImageGallery";

interface ImageUploaderProps {
  onImagesSelected: (images: File[], orderedImages: File[]) => void;
  maxImages?: number;
  existingImages?: Array<{id: string, url: string}>;
  onExistingImagesChange?: (images: Array<{id: string, url: string}>) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesSelected,
  maxImages = 5,
  existingImages = [],
  onExistingImagesChange
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create a merged array of all images (existing + new) for display
  const allImages = [
    ...existingImages,
    ...previewUrls.map((url, index) => ({
      id: `new-${index}`,
      url
    }))
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (!files.length) return;
    
    // Check if adding these images would exceed the maximum
    const totalImagesCount = selectedFiles.length + existingImages.length + files.length;
    if (totalImagesCount > maxImages) {
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
    
    const newSelectedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newSelectedFiles);
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    
    // Notify parent component of selection
    onImagesSelected(validFiles, newSelectedFiles);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleReorder = (newOrder: Array<{url: string, id: string}>) => {
    // Split the reordered array back into existing and new images
    const newExistingImages: Array<{id: string, url: string}> = [];
    const newPreviewUrls: string[] = [];
    const newSelectedFiles: File[] = [];
    
    newOrder.forEach(item => {
      if (item.id.startsWith('new-')) {
        // This is a new image
        const index = parseInt(item.id.split('-')[1]);
        if (index >= 0 && index < selectedFiles.length) {
          newPreviewUrls.push(item.url);
          newSelectedFiles.push(selectedFiles[index]);
        }
      } else {
        // This is an existing image
        newExistingImages.push(item);
      }
    });
    
    // Update existing images if callback provided
    if (onExistingImagesChange) {
      onExistingImagesChange(newExistingImages);
    }
    
    // Update new images
    setPreviewUrls(newPreviewUrls);
    setSelectedFiles(newSelectedFiles);
    
    // Notify parent component about the changes to new images
    onImagesSelected([], newSelectedFiles);
  };
  
  const handleDelete = (imageId: string) => {
    if (imageId.startsWith('new-')) {
      // Delete from new images
      const index = parseInt(imageId.split('-')[1]);
      
      // Release the object URL to free memory
      URL.revokeObjectURL(previewUrls[index]);
      
      const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
      const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
      
      setPreviewUrls(newPreviewUrls);
      setSelectedFiles(newSelectedFiles);
      
      // Notify parent
      onImagesSelected([], newSelectedFiles);
    } else if (onExistingImagesChange) {
      // Delete from existing images
      const newExistingImages = existingImages.filter(img => img.id !== imageId);
      onExistingImagesChange(newExistingImages);
    }
  };
  
  const totalImagesCount = allImages.length;

  return (
    <div className="space-y-6">
      {allImages.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Images (Drag to reorder)</p>
          <DraggableImageGallery
            images={allImages}
            onReorder={handleReorder}
            onDelete={handleDelete}
            minImages={1}
            showDeleteConfirmation={false}
          />
        </div>
      )}
      
      {/* Upload button */}
      {totalImagesCount < maxImages && (
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
            <Upload className="mr-2 h-4 w-4" />
            {totalImagesCount === 0 ? 'Upload Images' : 'Add More Images'}
          </Button>
        </div>
      )}
      
      <p className="text-sm text-gray-500 text-center">
        {totalImagesCount} / {maxImages} images
        {totalImagesCount > 0 && " (drag to reorder)"}
      </p>
    </div>
  );
};

export default ImageUploader;
