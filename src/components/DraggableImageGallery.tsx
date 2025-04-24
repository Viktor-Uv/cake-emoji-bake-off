
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  TouchSensor
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from "react-i18next";
import { CakeImage } from "@/types/cake";

interface DraggableImageGalleryProps {
  images: CakeImage[];
  onReorder: (newOrder: CakeImage[]) => void;
  onDelete: (imageId: string) => void;
  minImages?: number;
  showDeleteConfirmation?: boolean;
  onImagesChange?: (images: CakeImage[]) => void; // Added this prop
}

const SortableImage = ({ image, onDelete, canDelete }: { 
  image: CakeImage, 
  onDelete: (id: string) => void,
  canDelete: boolean 
}) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="relative border-2 rounded-lg overflow-hidden border-gray-200"
      {...attributes}
      {...listeners}
    >
      <img 
        src={image.url} 
        alt=""
        className="w-full h-32 object-cover"
        draggable={false} // Prevent browser's native drag behavior
      />
      
      {canDelete && (
        <div className="absolute top-1 right-1">
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => onDelete(image.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const DraggableImageGallery: React.FC<DraggableImageGalleryProps> = ({
  images,
  onReorder,
  onDelete,
  minImages = 1,
  onImagesChange, // Added this prop usage
}) => {
  const { t } = useTranslation();
  
  // Configure sensors with better touch handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // This helps distinguish between scrolls and drags
        distance: 8, // Minimum distance before activation
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        // Use delay to differentiate drag from tap on mobile
        delay: 250,
        tolerance: 8,
      }
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      
      const newImages = [...images];
      const [movedItem] = newImages.splice(oldIndex, 1);
      newImages.splice(newIndex, 0, movedItem);
      
      onReorder(newImages);
      
      // Also call onImagesChange if it exists
      if (onImagesChange) {
        onImagesChange(newImages);
      }
    }
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image) => (
              <SortableImage
                key={image.id}
                image={image}
                onDelete={onDelete}
                canDelete={images.length > minImages}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <p className="text-sm text-gray-500 text-center">
        {t("cakes.imagesCount", { count: images.length, max: 5 })}
        {images.length > 0 && ` (${t("cakes.dragToReorder")})`}
      </p>
    </div>
  );
};

export default DraggableImageGallery;
