import React, {useRef, useState, useEffect} from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { CakeImage, CakePreview } from "@/types/cake";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import RatingStars from "./RatingStars";
import { toast } from "@/components/ui/sonner";
import { updateCake, deleteCake } from "@/services/cakeService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "@/components/ImageUploader";
import { Pencil, Trash2 } from "lucide-react";

interface CakePreviewCardProps {
  cake: CakePreview;
  onCakeUpdated?: (updatedCake: CakePreview) => void;
  onCakeDeleted?: (cakeId: string) => void;
}

const CakePreviewCard: React.FC<CakePreviewCardProps> = ({ cake: initialCake, onCakeUpdated, onCakeDeleted }) => {
  const dialogCarouselApi = useRef<any>(null);
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cake, setCake] = useState<CakePreview>(initialCake);
  const [editedTitle, setEditedTitle] = useState(cake.title);
  const [editedDescription, setEditedDescription] = useState(cake.description);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Array<CakeImage>>(cake.images);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogActiveIndex, setDialogActiveIndex] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Update local state when the initial cake prop changes
  useEffect(() => {
    setCake(initialCake);
    setEditedTitle(initialCake.title);
    setEditedDescription(initialCake.description);
    setExistingImages(initialCake.images);
  }, [initialCake]);

  const handleImagesSelected = (allOrderedImages: File[]) => {
    setSelectedImages(allOrderedImages);
  };

  const handleExistingImagesChange = (updatedImages: Array<CakeImage>) => {
    setExistingImages(updatedImages);
  };

  const handleUpdateCake = async () => {
    if (!editedTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    if (existingImages.length === 0 && selectedImages.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    try {
      setLoading(true);

      const formattedExistingImages: CakeImage[] = existingImages.map((img) => ({
        id: img.id,
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
        thumbnailPath: img.thumbnailPath
      }));

      // Store the previous state for rollback in case of error
      const previousTitle = cake.title;
      const previousDescription = cake.description;
      const previousImages = [...cake.images];
      
      // Create updated cake object with new data
      const updatedCake: CakePreview = {
        ...cake,
        title: editedTitle,
        description: editedDescription,
        images: formattedExistingImages
      };
      
      // Update local state immediately
      setCake(updatedCake);

      // Then update the backend
      await updateCake(
        cake.id,
        editedTitle,
        editedDescription,
        selectedImages,
        formattedExistingImages
      );

      toast.success("Cake updated successfully!");
      setIsEditing(false);
      if (onCakeUpdated) {
        onCakeUpdated(updatedCake);
      }
    } catch (error) {
      console.error("Error updating cake:", error);
      toast.error("Failed to update cake. Please try again.");
      
      // Rollback to previous state if there was an error
      setCake({
        ...cake,
        title: cake.title,
        description: cake.description,
        images: cake.images
      });
      
      setEditedTitle(cake.title);
      setEditedDescription(cake.description);
      setExistingImages(cake.images);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCake = async () => {
    try {
      setLoading(true);
      await deleteCake(cake.id);
      toast.success("Cake deleted successfully!");
      if (onCakeDeleted) {
        onCakeDeleted(cake.id);
      }
    } catch (error) {
      console.error("Error deleting cake:", error);
      toast.error("Failed to delete cake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <label className="block text-sm font-medium mb-1">{t("cakes.title")}</label>
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder={t("cakes.title")}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t("cakes.description")}</label>
        <Textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder={t("cakes.description")}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t("cakes.photos")}
        </label>
        <ImageUploader
          onImagesSelected={handleImagesSelected}
          existingImages={existingImages}
          onExistingImagesChange={handleExistingImagesChange}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleUpdateCake} disabled={loading}>
          {t("cakes.saveChanges")}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setIsEditing(false);
            setEditedTitle(cake.title);
            setEditedDescription(cake.description);
            setExistingImages(cake.images);
          }}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </CardContent>
  );

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
              <h3 className="text-xl font-bold mb-2">{cake.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    title={t("cakes.editCake")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title={t("cakes.deleteCake")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("cakes.confirmDelete")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("cakes.deleteWarning")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCake}>
                          {t("common.delete")}
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
              {cake.description && (
                <p className="text-gray-700">{cake.description}</p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RatingStars
                    value={cake.ratingSummary.average}
                    readOnly
                    size="small"
                  />
                  <span className="text-sm text-gray-600">
                    {cake.ratingSummary.average.toFixed(1)}{" "}
                    ({cake.ratingSummary.count || 0}{" "}
                    {cake.ratingSummary.count % 10 === 1 ? t("cakes.ratingSingular") :
                      cake.ratingSummary.count % 10 >=2 && cake.ratingSummary.count % 10 <= 4 ? t("cakes.ratingPluralAlt") :
                        t("cakes.ratingPlural")})
                  </span>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          renderEditMode()
        )}
      </Card>

      <Dialog
        open={isImageOpen}
        onOpenChange={(isOpen) => {
          setIsImageOpen(isOpen);
          if (!isOpen) {
            setActiveIndex(dialogActiveIndex); // Sync the main carousel to dialog
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{cake.title}</DialogTitle>
          </DialogHeader>

          <Carousel className="w-full"
                    setApi={(api) => {
                      dialogCarouselApi.current = api;
                      api?.on("select", () => {
                        setDialogActiveIndex(api.selectedScrollSnap());
                      });
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

            {cake.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                {cake.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === dialogActiveIndex ? 'bg-white' : 'bg-white/50'
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

export default CakePreviewCard;
