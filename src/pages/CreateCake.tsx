import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCake } from "@/services/cakeService";
import { useAuth } from "@/contexts/AuthContext";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import {useTranslation} from "react-i18next";

const CreateCake: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const formSchema = z.object({
    title: z.string().min(3, t("errors.validation.cakes.titleMin")).max(100),
    description: z.string().max(500).optional()
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleImagesSelected = (_: File[], orderedImages: File[]) => {
    setSelectedImages(orderedImages);
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to create a cake");
      navigate("/login");
      return;
    }

    if (selectedImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      setLoading(true);
      
      // Create the cake - the first image in the array is now the main one
      await createCake(
        values.title,
        values.description,
        selectedImages,
        0, // The first image is always the main one now
        user
      );
      
      toast.success("Cake created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating cake:", error);
      toast.error("Failed to create cake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold mb-4">{t("auth.signInRequired")}</h2>
        <p className="mb-6 text-gray-600">
          {t("auth.signInMessage")}
        </p>
        <Button onClick={() => navigate("/login")}>{t("auth.signIn")}</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("cakes.upload")}</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cakes.title")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("cakes.titlePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("cakes.description")}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t("cakes.descriptionPlaceholder")}
                    {...field} 
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("cakes.photos")}
            </label>
            <ImageUploader onImagesSelected={handleImagesSelected} />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("process.creating") : t("cakes.share")}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateCake;
