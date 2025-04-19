
import React, { useEffect, useState } from "react";
import { getCakesByRating } from "@/services/cakeService";
import { Cake } from "@/types/cake";
import CakeCard from "@/components/CakeCard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const TopRated: React.FC = () => {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCakes = async () => {
    if (!user) return; // Skip fetching if user is not signed in
    
    try {
      setLoading(true);
      const fetchedCakes = await getCakesByRating();
      setCakes(fetchedCakes);
    } catch (error) {
      console.error("Error fetching top rated cakes:", error);
      toast.error("Failed to load top rated cakes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCakes();
    } else {
      // Reset cakes when user logs out
      setCakes([]);
      setLoading(false);
    }
  }, [user]);

  const handleRatingChange = () => {
    if (user) fetchCakes();
  };
  
  const handleCakeUpdate = () => {
    if (user) fetchCakes();
  };
  
  const handleCakeDelete = (cakeId: string) => {
    setCakes(cakes.filter(cake => cake.id !== cakeId));
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
        <div className="text-6xl mb-6">⭐</div>
        <h2 className="text-2xl font-bold mb-4">Sign in to see top rated cakes</h2>
        <p className="mb-6 text-gray-600">
          Join our community to rate and discover amazing cake creations.
        </p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin text-4xl mb-4">🍰</div>
        <p>Loading top-rated cakes...</p>
      </div>
    );
  }

  if (cakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
        <div className="text-6xl mb-6">⭐</div>
        <h2 className="text-2xl font-bold mb-4">No rated cakes yet!</h2>
        <p className="mb-6 text-gray-600">
          Rate some cakes on the feed page to see them appear here.
        </p>
        <Link to="/">
          <Button>Go to Feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Top Rated Cakes</h2>
      <div>
        {cakes.map((cake) => (
          <CakeCard 
            key={cake.id} 
            cake={cake} 
            onRatingChange={handleRatingChange} 
            onCakeUpdate={handleCakeUpdate}
            onCakeDelete={() => handleCakeDelete(cake.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TopRated;
