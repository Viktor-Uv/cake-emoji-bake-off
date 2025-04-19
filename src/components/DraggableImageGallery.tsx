
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DraggableImageGalleryProps {
  images: Array<{url: string, id: string}>;
  onReorder: (newOrder: Array<{url: string, id: string}>) => void;
  onDelete: (imageId: string) => void;
  minImages?: number;
}

const DraggableImageGallery: React.FC<DraggableImageGalleryProps> = ({
  images,
  onReorder,
  onDelete,
  minImages = 1
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Create a new array with the dragged item moved to the new position
    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    
    onReorder(newImages);
    setDraggedIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  const handleDelete = (id: string) => {
    // Only allow deletion if we have more than the minimum required images
    if (images.length <= minImages) return;
    onDelete(id);
  };
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {images.map((image, index) => (
        <div 
          key={image.id} 
          className={`relative border-2 rounded-lg overflow-hidden ${
            draggedIndex === index ? 'border-primary opacity-50' : 'border-gray-200'
          }`}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          style={{ touchAction: "none" }} // Better touch support
        >
          <img 
            src={image.url} 
            alt={`Image ${index + 1}`} 
            className="w-full h-32 object-cover"
          />
          
          <div className="absolute top-1 right-1">
            {images.length > minImages && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Image</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this image? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(image.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DraggableImageGallery;
