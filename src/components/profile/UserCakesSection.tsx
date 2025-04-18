
import React from "react";
import { Cake } from "@/types/cake";
import CakeCard from "@/components/CakeCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarRange, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "date-desc" | "date-asc" | "rating-desc";

interface UserCakesSectionProps {
  cakes: Cake[];
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  isLoading: boolean;
}

const UserCakesSection: React.FC<UserCakesSectionProps> = ({
  cakes,
  sortOption,
  onSortChange,
  isLoading,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin text-4xl mb-4">🍰</div>
        <p>Loading your cakes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold mb-2 sm:mb-0">Your Cake Creations</h2>
        
        <div className="w-full sm:w-auto">
          <Select
            value={sortOption}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  <span>Newest First</span>
                </div>
              </SelectItem>
              <SelectItem value="date-asc">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  <span>Oldest First</span>
                </div>
              </SelectItem>
              <SelectItem value="rating-desc">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Highest Rated</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {cakes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {cakes.map((cake) => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎂</div>
          <h3 className="text-lg font-medium mb-2">No cakes yet!</h3>
          <p className="text-gray-500 mb-6">
            You haven't uploaded any Easter cake creations yet.
          </p>
          <Button onClick={() => navigate("/create")}>
            Upload Your First Cake
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserCakesSection;
