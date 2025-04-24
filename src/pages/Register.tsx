
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import EmojiPicker from "@/components/EmojiPicker";
import LanguageSelector from "@/components/common/LanguageSelector";

const Register = () => {
  const { t } = useTranslation();
  const { signUp, user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const formSchema = z.object({
    displayName: z.string().min(2, t("errors.validation.auth.name")),
    email: z.string().email(t("errors.validation.auth.email")),
    password: z.string().min(6, t("errors.validation.auth.password")),
    emoji: z.string(),
  });

  type FormData = z.infer<typeof formSchema>;
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      emoji: "🍰",
    },
  });

  const onSubmit = async (values: FormData) => {
    setSubmitting(true);
    await signUp(
      values.email, 
      values.password, 
      values.displayName,
      values.emoji
    );
    setSubmitting(false);
  };

  if (user) {
    return <Navigate to="/profile" />;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">{t("auth.createAccountTitle")}</h1>
          <p className="text-gray-600 mt-1">{t("auth.createAccountDesc")}</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.displayName")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t("auth.yourName")} 
                      autoComplete="name"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.email")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@example.com" 
                      autoComplete="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.password")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••" 
                      autoComplete="new-password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.chooseAvatar")}</FormLabel>
                  <FormControl>
                    <EmojiPicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={submitting || loading}
            >
              {submitting ? t("auth.creatingAccount") : t("auth.createAccountButton")}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline">
              {t("auth.signIn")}
            </Link>
          </p>
        </div>

        <div className="mt-4">
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
};

export default Register;
