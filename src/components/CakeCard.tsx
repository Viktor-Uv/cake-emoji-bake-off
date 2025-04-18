
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

interface CakeCardProps {
  cake: Cake;
  onRatingChange?: () => void;
}

const CakeCard: React.FC<CakeCardProps> = ({ cake, onRatingChange }) => {
  const { user } = useAuth();
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Find the main image
  const mainImage = cake.images.find((img) => img.isMain) || cake.images[0];
  
  // Check if the current user has already rated this cake
  const userRating = cake.ratings?.find((r) => r.userId === user?.id)?.rating || 0;
  
  const handleRating = async (rating: number) => {
    if (!user) {
      toast.error("Please sign in to rate cakes");
      return;
    }
    
    try {
      setLoading(true);
      await rateCake(cake.id, rating, user);
      toast.success("Cake rated successfully!");
      
      // Call the callback if provided to refresh the data
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

  return (
    <>
      <Card className="mb-6 overflow-hidden cake-shadow hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{cake.userEmoji}</span>
              <span className="font-medium">{cake.userName || "Anonymous Baker"}</span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(cake.createdAt)}
            </span>
          </div>
        </CardHeader>
        
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
          <p className="text-gray-700">{cake.description}</p>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <RatingStars 
                value={cake.averageRating} 
                readOnly 
                size="small"
              />
              <span className="ml-2 text-sm text-gray-600">
                ({cake.ratings?.length || 0} {cake.ratings?.length === 1 ? 'rating' : 'ratings'})
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex flex-col items-stretch">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-medium">Rate this cake:</span>
            <RatingStars 
              value={userRating} 
              onChange={handleRating}
              disabled={loading}
            />
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => setIsImageOpen(true)}
          >
            View All Photos ({cake.images.length})
          </Button>
        </CardFooter>
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
