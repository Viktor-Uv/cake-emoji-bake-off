
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import UserProfileCard from "@/components/profile/UserProfileCard";
import UserCakesSection, { SortOption } from "@/components/profile/UserCakesSection";
import LanguageSelector from "@/components/common/LanguageSelector";

const Profile: React.FC = () => {
  const { user, signOut, loading, updateUserAvatar } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAvatarChange = async (emoji: string) => {
    await updateUserAvatar(emoji);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin text-4xl mb-4">🍰</div>
        <p>{t("profile.loading")}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-6">👋</div>
          <h1 className="text-2xl font-bold mb-4">{t("profile.welcome")}</h1>
          <p className="mb-8 text-gray-600">
            {t("profile.joinMessage")}
          </p>
          
          <div className="space-y-4 w-full">
            <Button 
              className="w-full"
              onClick={() => navigate("/login")}
            >
              {t("common.signIn")}
            </Button>
            
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => navigate("/register")}
            >
              {t("profile.createAccount")}
            </Button>
          </div>
          
          <div className="mt-8 w-full">
            <LanguageSelector />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="w-full md:w-1/3">
          <UserProfileCard 
            user={user}
            onAvatarChange={handleAvatarChange}
            onSignOut={signOut}
          />
        </div>
        
        <div className="w-full md:w-2/3">
          <UserCakesSection />
        </div>
      </div>
    </div>
  );
};

export default Profile;
