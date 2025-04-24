
import React, { useState } from "react";
import { CakePreview, CakeImage } from "@/types/cake";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DraggableImageGallery from "./DraggableImageGallery";
import ImageUploader from "./ImageUploader";
import { updateCake, deleteCake } from "@/services/cakeService";
import { useQueryClient } from "@tanstack/react-query";

interface CakePreviewCardProps {
  cake: CakePreview;
  onCakeUpdated: (updatedCake: CakePreview) => void;
  onCakeDeleted: (cakeId: string) => void;
}

const CakePreviewCard: React.FC<CakePreviewCardProps> = ({
  cake,
  onCakeUpdated,
  onCakeDeleted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(cake.title);
  const [description, setDescription] = useState(cake.description);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleImagesSelected = async (images: File[]) => {
    try {
      await updateCake(cake.id, title, description, images, cake.images);
      const updatedCake = { ...cake, images: [...cake.images] };
      onCakeUpdated(updatedCake);
      toast.success("Images updated successfully!");
    } catch (error) {
      console.error("Error updating images:", error);
      toast.error("Failed to update images");
    }
  };

  const handleExistingImagesChange = async (images: CakeImage[]) => {
    try {
      await updateCake(cake.id, title, description, undefined, images);
      const updatedCake = { ...cake, images };
      onCakeUpdated(updatedCake);
      toast.success("Images updated successfully!");
    } catch (error) {
      console.error("Error updating images:", error);
      toast.error("Failed to update images");
    }
  };

  const handleSave = async () => {
    try {
      await updateCake(cake.id, title, description, undefined, cake.images);
      const updatedCake = { ...cake, title, description };
      onCakeUpdated(updatedCake);
      setIsEditing(false);
      toast.success("Cake updated successfully!");
    } catch (error) {
      console.error("Error updating cake:", error);
      toast.error("Failed to update cake");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCake(cake.id);
      onCakeDeleted(cake.id);
      queryClient.invalidateQueries({ queryKey: ["cakes"] });
      toast.success("Cake deleted successfully!");
    } catch (error) {
      console.error("Error deleting cake:", error);
      toast.error("Failed to delete cake");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          {isEditing ? (
            <div className="w-full space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Cake title"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cake description"
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTitle(cake.title);
                    setDescription(cake.description);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{cake.title}</h3>
              <p className="text-gray-600">{cake.description}</p>
            </div>
          )}
          {!isEditing && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Cake</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this cake? This action cannot
                      be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div className="mt-4">
          <DraggableImageGallery
            images={cake.images}
            onImagesChange={handleExistingImagesChange}
          />
          <ImageUploader onImagesSelected={handleImagesSelected} />
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">★</span>
            <span>{cake.averageRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CakePreviewCard;
