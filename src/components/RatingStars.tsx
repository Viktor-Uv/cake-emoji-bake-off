
import React from "react";
import { Cake } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  value = 0,
  readOnly = false,
  onChange,
  size = "medium",
  disabled = false
}) => {
  const MAX_RATING = 5;
  
  // Determine star size based on prop
  const starSize = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8"
  }[size];
  
  // Create an array of 5 stars
  const stars = Array.from({ length: MAX_RATING }, (_, i) => i + 1);

  return (
    <div className="flex items-center">
      {stars.map((star) => {
        const isActive = star <= value;
        
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly || disabled}
            onClick={() => onChange?.(star)}
            className={cn(
              "cursor-default transition-colors mr-0.5",
              !readOnly && !disabled && "hover:text-primary cursor-pointer",
              isActive ? "text-cake-yellow" : "text-gray-300"
            )}
          >
            <Cake className={starSize} />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
