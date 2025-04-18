
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

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(), // Make description optional
});

type FormValues = z.infer<typeof formSchema>;

const CreateCake: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleImagesSelected = (images: File[], mainIndex: number) => {
    setSelectedImages(images);
    setMainImageIndex(mainIndex);
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
      
      // Create the cake
      await createCake(
        values.title,
        values.description,
        selectedImages,
        mainImageIndex,
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
        <h2 className="text-2xl font-bold mb-4">You must be signed in</h2>
        <p className="mb-6 text-gray-600">
          Please sign in or create an account to upload your cake.
        </p>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Upload Your Easter Cake</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cake Title</FormLabel>
                <FormControl>
                  <Input placeholder="My Delicious Easter Cake" {...field} />
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
                <FormLabel>Cake Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about your cake! What makes it special?" 
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
              Cake Photos
            </label>
            <ImageUploader onImagesSelected={handleImagesSelected} />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Share Your Cake"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateCake;
