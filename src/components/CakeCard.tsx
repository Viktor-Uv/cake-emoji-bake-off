
import React, { useState } from "react";
import { format } from "date-fns";
import { Cake } from "@/types/cake";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import RatingStars from "./RatingStars";
import { toast } from "@/components/ui/sonner";
import { rateCake, updateCake, deleteCake } from "@/services/cakeService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "@/components/ImageUploader";
import { Pencil, Trash2 } from "lucide-react";

interface CakeCardProps {
  cake: Cake;
  onRatingChange?: () => void;
  onCakeUpdate?: () => void;
  onCakeDelete?: () => void;
}

const CakeCard: React.FC<CakeCardProps> = ({ cake, onRatingChange, onCakeUpdate, onCakeDelete }) => {
  const { user } = useAuth();
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(cake.title);
  const [editedDescription, setEditedDescription] = useState(cake.description);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{id: string, url: string}>>(
    cake.images.map(img => ({ id: img.id, url: img.url }))
  );
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Check if the current user has already rated this cake
  const userRating = cake.ratings?.find((r) => r.userId === user?.id)?.rating || 0;
  
  // Check if this is the user's own cake
  const isOwnCake = user?.id === cake.userId;
  
  const handleRating = async (rating: number) => {
    if (!user) {
      toast.error("Please sign in to rate cakes");
      return;
    }
    
    if (isOwnCake) {
      toast.error("You cannot rate your own cake!");
      return;
    }
    
    try {
      setLoading(true);
      await rateCake(cake.id, rating, user);
      toast.success("Cake rated successfully!");
      
      if (onRatingChange) {
        onRatingChange();
      }
    } catch (error) {
      console.error("Error rating cake:", error);
      toast.error("Failed to rate cake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImagesSelected = (newImages: File[], allOrderedImages: File[]) => {
    setSelectedImages(allOrderedImages);
  };

  const handleExistingImagesChange = (updatedImages: Array<{id: string, url: string}>) => {
    setExistingImages(updatedImages);
  };

  const handleUpdateCake = async () => {
    if (!editedTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    
    // Check if we have at least one image (either existing or new)
    if (existingImages.length === 0 && selectedImages.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    try {
      setLoading(true);
      
      // Convert existing images back to the CakeImage format
      const formattedExistingImages = existingImages.map((img, index) => ({
        id: img.id,
        url: img.url,
        isMain: index === 0 // First image is main
      }));
      
      await updateCake(
        cake.id,
        editedTitle,
        editedDescription,
        selectedImages,
        formattedExistingImages
      );
      
      toast.success("Cake updated successfully!");
      setIsEditing(false);
      if (onCakeUpdate) {
        onCakeUpdate();
      }
    } catch (error) {
      console.error("Error updating cake:", error);
      toast.error("Failed to update cake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCake = async () => {
    try {
      setLoading(true);
      await deleteCake(cake.id);
      toast.success("Cake deleted successfully!");
      if (onCakeDelete) {
        onCakeDelete();
      }
    } catch (error) {
      console.error("Error deleting cake:", error);
      toast.error("Failed to delete cake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Safely format the date, handling potential invalid date values
  const formatDate = (dateValue: any): string => {
    try {
      if (!dateValue) return "Unknown date";
      
      if (dateValue && typeof dateValue.toDate === 'function') {
        return format(dateValue.toDate(), "MMM d, yyyy");
      }
      
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }
      
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  const renderEditMode = () => (
    <CardContent className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="Cake title"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Cake description (optional)"
          rows={4}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Photos
        </label>
        <ImageUploader 
          onImagesSelected={handleImagesSelected}
          existingImages={existingImages}
          onExistingImagesChange={handleExistingImagesChange}
        />
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button onClick={handleUpdateCake} disabled={loading}>
          Save Changes
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setIsEditing(false);
            setEditedTitle(cake.title);
            setEditedDescription(cake.description);
            setExistingImages(cake.images.map(img => ({ id: img.id, url: img.url })));
          }}
        >
          Cancel
        </Button>
      </div>
    </CardContent>
  );

  // Helper function to get appropriate image URL
  const getImageUrl = (image: any) => {
    return image.thumbnailUrl || image.url;
  };

  const getFullImageUrl = (image: any) => {
    return image.url;
  };

  return (
    <>
      <Card className="mb-6 overflow-hidden cake-shadow hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{cake.userEmoji}</span>
              <span className="font-medium">{cake.userName || "Anonymous Baker"}</span>
            </div>
            <div className="flex items-center gap-2">
              {isOwnCake && !isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Cake</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this cake? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCake}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              <span className="text-xs text-gray-500">
                {formatDate(cake.createdAt)}
              </span>
            </div>
          </div>
        </CardHeader>
        
        {!isEditing ? (
          <>
            <div className="px-4 relative">
              <Carousel className="w-full cursor-pointer" 
                onClick={() => setIsImageOpen(true)}
                setApi={(api) => {
                  api?.on("select", () => {
                    setActiveIndex(api.selectedScrollSnap());
                  });
                }}
              >
                <CarouselContent>
                  {cake.images.map((image, index) => (
                    <CarouselItem key={image.id}>
                      <div className="h-64 w-full overflow-hidden">
                        <img 
                          src={getImageUrl(image)} 
                          alt={`${cake.title} - ${index + 1}`} 
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                {/* Instagram-style dots indicator */}
                {cake.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                    {cake.images.map((_, index) => (
                      <div 
                        key={index} 
                        className={`w-2 h-2 rounded-full ${
                          index === activeIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </Carousel>
            </div>
            
            <CardContent className="pt-4">
              <h3 className="text-xl font-bold mb-2">{cake.title}</h3>
              {cake.description && (
                <p className="text-gray-700">{cake.description}</p>
              )}
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RatingStars 
                    value={cake.averageRating} 
                    readOnly 
                    size="small"
                  />
                  <span className="text-sm text-gray-600">
                    {cake.averageRating.toFixed(1)} ({cake.ratings?.length || 0} {cake.ratings?.length === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-4 flex flex-col items-stretch">
              {!isOwnCake && (
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-medium">Rate this cake:</span>
                  <RatingStars 
                    value={userRating} 
                    onChange={handleRating}
                    disabled={loading}
                  />
                </div>
              )}
            </CardFooter>
          </>
        ) : (
          renderEditMode()
        )}
      </Card>
      
      {/* Image Gallery Dialog */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{cake.title}</DialogTitle>
          </DialogHeader>
          
          <Carousel className="w-full"
            setApi={(api) => {
              api?.scrollTo(activeIndex);
            }}
          >
            <CarouselContent>
              {cake.images.map((image, index) => (
                <CarouselItem key={image.id}>
                  <div className="flex aspect-square items-center justify-center p-2">
                    <img 
                      src={getFullImageUrl(image)} 
                      alt={`${cake.title} - Photo ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Instagram-style dots for fullscreen view */}
            {cake.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                {cake.images.map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-2 h-2 rounded-full ${
                      index === activeIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CakeCard;
