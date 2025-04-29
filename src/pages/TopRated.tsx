
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Cake } from "@/types/cake";
import CakeCard from "@/components/CakeCard";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/common/LanguageSelector";

const TopRated: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [topCakes, setTopCakes] = useState<Cake[]>([]);
  const [loadingCakes, setLoadingCakes] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchTopRatedCakes();
    }
  }, [user]);

  const fetchTopRatedCakes = async () => {
    setLoadingCakes(true);
    
    try {
      const cakesQuery = query(
        collection(firestore, "cakes"),
        orderBy("averageRating", "desc"),
        limit(10)
      );
      
      const cakesSnapshot = await getDocs(cakesQuery);
      const cakesList: Cake[] = [];
      
      cakesSnapshot.forEach((doc) => {
        const cakeData = doc.data() as Cake;
        cakesList.push({
          ...cakeData,
          id: doc.id
        });
      });
      
      setTopCakes(cakesList);
    } catch (error) {
      console.error("Error fetching top rated cakes:", error);
    } finally {
      setLoadingCakes(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-2xl font-bold mb-4">{t("topRated.title")}</h1>
          <p className="mb-8 text-gray-600">
            {t("topRated.join")}
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

  if (loading || loadingCakes) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin text-4xl mb-4">🍰</div>
        <p>{t("topRated.loading")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {topCakes.length === 0 ? (
        <div className="max-w-md">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-6">🎂</div>
            <h1 className="text-2xl font-bold mb-4">{t("cakes.noCakes")}</h1>
            <p className="mb-8 text-gray-600">
              {t("cakes.noCakesDesc")}
            </p>

            <div className="space-y-4 w-full">
              <Button
                className="w-full"
                onClick={() => navigate("/create")}
              >
                {t("cakes.create")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topCakes.map((cake) => (
            <CakeCard 
              key={cake.id} 
              cake={cake} 
              onRatingChange={() => {
              }}
              onCakeUpdate={() => {
              }}
              onCakeDelete={() => {
                setTopCakes(topCakes.filter(c => c.id !== cake.id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopRated;
