
import React, { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Cake } from "@/types/cake";
import CakeCard from "@/components/CakeCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/common/LanguageSelector";

// Helper function to add days to date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Easter 2023 date
const easter2023 = new Date(2023, 3, 9); // April 9, 2023

// Function to get the date range for displaying cakes
const getCakeDisplayDateRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  
  // Determine if we should show around easter 2023 or easter 2024
  const showEaster2023 = today.getTime() < new Date(2023, 11, 31).getTime();
  
  const easterDate = showEaster2023 ? easter2023 : new Date(2024, 3, 31); // April 31, 2024
  
  const startDate = addDays(easterDate, -7); // 1 week before Easter
  const endDate = addDays(easterDate, 7); // 1 week after Easter
  
  return { startDate, endDate, showEaster2023 };
};

const Index: React.FC = () => {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    fetchRecentCakes();
  }, []);

  const fetchRecentCakes = async () => {
    try {
      setLoading(true);
      
      const cakesQuery = query(
        collection(firestore, "cakes"), 
        orderBy("createdAt", "desc"),
        limit(50)
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
      
      setCakes(cakesList);
    } catch (error) {
      console.error("Error fetching cakes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin text-4xl mb-4">🍰</div>
        <p>{t("cakes.loading")}</p>
      </div>
    );
  }

  if (cakes.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-6xl mb-6">🍰</div>
        <h2 className="text-2xl font-bold mb-4">{t("cakes.noCakes")}</h2>
        <p className="text-gray-500 mb-8">{t("cakes.createCakes")}</p>
        
        {user ? (
          <Button onClick={() => navigate("/create")}>
            {t("cakes.share")}
          </Button>
        ) : (
          <div className="space-y-4">
            <Button onClick={() => navigate("/login")}>
              {t("common.signIn")}
            </Button>
            <div className="mt-4">
              <LanguageSelector />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {!user && (
        <div className="mb-8 p-6 bg-primary/5 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h1 className="text-xl font-bold mb-2">{t("common.welcome")}</h1>
              <p className="text-gray-600">{t("profile.signInMessage")}</p>
            </div>
            <div className="flex flex-col space-y-3 w-full md:w-auto">
              <Button onClick={() => navigate("/login")}>
                {t("common.signIn")}
              </Button>
              <LanguageSelector className="min-w-[200px]" />
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cakes.map((cake) => (
          <CakeCard key={cake.id} cake={cake} />
        ))}
      </div>
    </div>
  );
};

export default Index;
