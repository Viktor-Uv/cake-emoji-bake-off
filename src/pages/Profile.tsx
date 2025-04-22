
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Cake } from "@/types/cake";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import UserProfileCard from "@/components/profile/UserProfileCard";
import UserCakesSection, { SortOption } from "@/components/profile/UserCakesSection";
import LanguageSelector from "@/components/common/LanguageSelector";

const Profile: React.FC = () => {
  const { user, signOut, loading, updateUserAvatar } = useAuth();
  const { t } = useTranslation();
  const [userCakes, setUserCakes] = useState<Cake[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [loadingCakes, setLoadingCakes] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchUserCakes(sortOption);
    }
  }, [user, sortOption]);
  
  const fetchUserCakes = async (sort: SortOption) => {
    if (!user) return;
    
    setLoadingCakes(true);
    try {
      let cakesQuery;
      
      switch (sort) {
        case "date-asc":
          cakesQuery = query(
            collection(firestore, "cakes"), 
            where("userId", "==", user.id),
            orderBy("createdAt", "asc")
          );
          break;
          
        case "rating-desc":
          cakesQuery = query(
            collection(firestore, "cakes"), 
            where("userId", "==", user.id),
            orderBy("averageRating", "desc")
          );
          break;
          
        case "date-desc":
        default:
          cakesQuery = query(
            collection(firestore, "cakes"), 
            where("userId", "==", user.id),
            orderBy("createdAt", "desc")
          );
          break;
      }
      
      const cakesSnapshot = await getDocs(cakesQuery);
      const cakesList: Cake[] = [];
      
      cakesSnapshot.forEach((doc) => {
        const cakeData = doc.data() as Cake;
        cakesList.push({
          ...cakeData,
          id: doc.id
        });
      });
      
      setUserCakes(cakesList);
    } catch (error) {
      console.error("Error fetching user cakes:", error);
      toast.error("Failed to load your cakes. Please try again.");
    } finally {
      setLoadingCakes(false);
    }
  };

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
          <UserCakesSection
            cakes={userCakes}
            sortOption={sortOption}
            onSortChange={setSortOption}
            isLoading={loadingCakes}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
