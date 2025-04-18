import React, { useState } from "react";
import { format } from "date-fns";
import { Cake } from "@/types/cake";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import RatingStars from "./RatingStars";
import { toast } from "@/components/ui/sonner";
import { rateCake } from "@/services/cakeService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "@/components/ImageUploader";
import { Pencil } from "lucide-react";

interface CakeCardProps {
  cake: Cake;
  onRatingChange?: () => void;
  onCakeUpdate?: () => void;
}

const CakeCard: React.FC<CakeCardProps> = ({ cake, onRatingChange, onCakeUpdate }) => {
  const { user } = useAuth();
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(cake.title);
  const [editedDescription, setEditedDescription] = useState(cake.description);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  
  // Find the main image
  const mainImage = cake.images.find((img) => img.isMain) || cake.images[0];
  
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

  const handleUpdateCake = async () => {
    if (!editedTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    
    try {
      setLoading(true);
      await updateCake(
        cake.id,
        editedTitle,
        editedDescription,
        selectedImages,
        mainImageIndex,
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

  // Safely format the date, handling potential invalid date values
  const formatDate = (dateValue: any): string => {
    try {
      // Check if dateValue is a valid date
      if (!dateValue) return "Unknown date";
      
      // If it's a timestamp from Firestore with toDate method
      if (dateValue && typeof dateValue.toDate === 'function') {
        return format(dateValue.toDate(), "MMM d, yyyy");
      }
      
      // For regular Date objects or timestamp converted to Date
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      
      // Validate the date is not invalid
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
          Update Photos (Optional)
        </label>
        <ImageUploader onImagesSelected={(images, mainIndex) => {
          setSelectedImages(images);
          setMainImageIndex(mainIndex);
        }} />
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
          }}
        >
          Cancel
        </Button>
      </div>
    </CardContent>
  );

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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <span className="text-xs text-gray-500">
                {formatDate(cake.createdAt)}
              </span>
            </div>
          </div>
        </CardHeader>
        
        {!isEditing ? (
          <>
            <div 
              className="h-64 w-full overflow-hidden cursor-pointer"
              onClick={() => setIsImageOpen(true)}
            >
              <img 
                src={mainImage.url} 
                alt={cake.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
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
              
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => setIsImageOpen(true)}
              >
                View All Photos ({cake.images.length})
              </Button>
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
          
          <Carousel className="w-full">
            <CarouselContent>
              {cake.images.map((image, index) => (
                <CarouselItem key={image.id}>
                  <div className="flex aspect-square items-center justify-center p-2">
                    <img 
                      src={image.url} 
                      alt={`${cake.title} - Photo ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CakeCard;
