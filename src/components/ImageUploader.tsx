
import React, { useState, useRef, ChangeEvent } from "react";
import { Upload, Trash2 } from "lucide-react";
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
  
  // Format preview images as needed for DraggableImageGallery
  const previewImages = previewUrls.map((url, index) => ({
    id: `new-${index}`,
    url
  }));

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

  const handleReorderNewImages = (newOrder: Array<{url: string, id: string}>) => {
    // Create new arrays with reordered images
    const newPreviewUrls: string[] = [];
    const newSelectedFiles: File[] = [];
    
    newOrder.forEach(item => {
      // Extract the index from the "new-X" id
      const idParts = item.id.split('-');
      if (idParts[0] === 'new') {
        const index = parseInt(idParts[1]);
        newPreviewUrls.push(previewUrls[index]);
        newSelectedFiles.push(selectedFiles[index]);
      }
    });
    
    setPreviewUrls(newPreviewUrls);
    setSelectedFiles(newSelectedFiles);
    
    // Notify parent component of the reordered images
    onImagesSelected([], newSelectedFiles);
  };

  const handleDeleteNewImage = (imageId: string) => {
    // Extract the index from the "new-X" id
    const idParts = imageId.split('-');
    if (idParts[0] === 'new') {
      const index = parseInt(idParts[1]);
      
      // Release the object URL to free memory
      URL.revokeObjectURL(previewUrls[index]);
      
      const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
      const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
      
      setPreviewUrls(newPreviewUrls);
      setSelectedFiles(newSelectedFiles);
      
      // Notify parent component of the change
      onImagesSelected([], newSelectedFiles);
    }
  };

  const handleReorderExistingImages = (newOrder: Array<{url: string, id: string}>) => {
    if (onExistingImagesChange) {
      onExistingImagesChange(newOrder);
    }
  };

  const handleDeleteExistingImage = (imageId: string) => {
    if (onExistingImagesChange && existingImages) {
      const newExistingImages = existingImages.filter(img => img.id !== imageId);
      onExistingImagesChange(newExistingImages);
    }
  };
  
  const totalImagesCount = selectedFiles.length + existingImages.length;

  return (
    <div className="space-y-6">
      {existingImages && existingImages.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Current Images (Drag to reorder)</h3>
          <DraggableImageGallery
            images={existingImages}
            onReorder={handleReorderExistingImages}
            onDelete={handleDeleteExistingImage}
            minImages={selectedFiles.length > 0 ? 0 : 1} // Allow deleting all existing if new images are selected
          />
        </div>
      )}
      
      {previewUrls.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">New Images (Drag to reorder)</h3>
          <DraggableImageGallery
            images={previewImages}
            onReorder={handleReorderNewImages}
            onDelete={handleDeleteNewImage}
            minImages={existingImages.length > 0 ? 0 : 1} // Allow deleting all new if existing images exist
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
