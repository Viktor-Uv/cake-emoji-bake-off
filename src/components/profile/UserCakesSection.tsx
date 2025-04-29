import React, {useState} from "react";
import CakePreviewCard from "@/components/CakePreviewCard";
import {Button} from "@/components/ui/button";
import {useNavigate} from "react-router-dom";
import {CalendarRange, Star} from "lucide-react";
import {useAuth} from "@/contexts/AuthContext";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useTranslation} from "react-i18next";
import {CakePreview} from "@/types/cake";

export type SortOption = "date-desc" | "date-asc" | "rating-desc";

const UserCakesSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);

  const getSortedCakes = () => {
    if (!user?.createdCakes) return [];

    const cakes = [...user.createdCakes];
    switch (sortOption) {
      case "date-asc":
        return cakes.reverse(); // Assuming cakes are already sorted by date desc
      case "rating-desc":
        return cakes.sort((a, b) => b.ratingSummary.average - a.ratingSummary.average);
      case "date-desc":
      default:
        return cakes;
    }
  };

  const handleCakeUpdated = (updatedCake: CakePreview) => {
    if (!user) return;
    
    // Create a copy of the user's cakes with the updated cake
    const updatedCakes = user.createdCakes.map(cake =>
      cake.id === updatedCake.id ? updatedCake : cake
    );
    
    // Create a new user object with the updated cakes array
    const updatedUser = {
      ...user,
      createdCakes: updatedCakes
    };
    
    // Update the user reference with the new object
    Object.assign(user, updatedUser);
    
    // Force component re-render by creating a new state reference
    setForceUpdate(prev => !prev);
  };

  const handleCakeDeleted = (cakeId: string) => {
    if (!user) return;
    
    // Filter out the deleted cake
    const updatedCakes = user.createdCakes.filter(cake => cake.id !== cakeId);
    
    // Create a new user object with the updated cakes array
    const updatedUser = {
      ...user,
      createdCakes: updatedCakes
    };
    
    // Update the user reference with the new object to trigger re-render
    Object.assign(user, updatedUser);
    
    // Force component re-render by creating a new array reference
    setForceUpdate(prev => !prev);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold mb-2 sm:mb-0">{t("profile.yourCakes")}</h2>
        
        <div className="w-full sm:w-auto">
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  <span>{t("common.sortNewestFirst")}</span>
                </div>
              </SelectItem>
              <SelectItem value="date-asc">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  <span>{t("common.sortOldestFirst")}</span>
                </div>
              </SelectItem>
              <SelectItem value="rating-desc">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>{t("common.sortHighestRated")}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {user && user.createdCakes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Add forceUpdate as a key to force re-render when it changes */}
          <div key={`cakes-list-${forceUpdate}`}>
            {getSortedCakes().map((cake) => (
              <CakePreviewCard
                key={cake.id}
                cake={cake}
                onCakeUpdated={handleCakeUpdated}
                onCakeDeleted={handleCakeDeleted}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎂</div>
          <h3 className="text-lg font-medium mb-2">{t("profile.noCakes")}</h3>
          <p className="text-gray-500 mb-6">
            {t("profile.noCakesDesc")}
          </p>
          <Button
            className="w-full"
            onClick={() => navigate("/create")}
          >
            {t("profile.uploadFirst")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserCakesSection;
