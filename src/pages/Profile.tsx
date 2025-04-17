
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EMOJI_OPTIONS } from "@/constants/emoji-constants";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "@/components/EmojiPicker";
import { Input } from "@/components/ui/input";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import CakeCard from "@/components/CakeCard";
import { Cake } from "@/types/cake";
import { ArrowDownAZ, ArrowUpAZ, CalendarRange, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

type SortOption = "date-desc" | "date-asc" | "rating-desc";

const Profile: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [userCakes, setUserCakes] = useState<Cake[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [loadingCakes, setLoadingCakes] = useState(false);
  
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
  
  // This is just a placeholder for avatar updates
  const handleAvatarChange = async (emoji: string) => {
    if (!user) return;
    
    try {
      const userRef = doc(firestore, "users", user.id);
      await updateDoc(userRef, {
        emojiAvatar: emoji
      });
      
      toast.success("Avatar updated successfully!");
      // After updating, refresh the page to see changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin text-4xl mb-4">🍰</div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-6">👋</div>
          <h1 className="text-2xl font-bold mb-4">Welcome to Easter Cake Bake-Off</h1>
          <p className="mb-8 text-gray-600">
            Sign in to upload your Easter cake creations and rate others!
          </p>
          
          <div className="space-y-4 w-full">
            <Button 
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => navigate("/register")}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* User Profile Section */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col items-center mb-6">
              <div className="text-6xl mb-4">{user.emojiAvatar}</div>
              <h1 className="text-xl font-bold">{user.displayName || "Cake Baker"}</h1>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <Input value={user.displayName || ""} disabled />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input value={user.email} disabled />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Emoji Avatar</label>
                <div className="flex items-center gap-4">
                  <EmojiPicker 
                    value={user.emojiAvatar} 
                    onChange={handleAvatarChange} 
                  />
                  <span className="text-xs text-gray-500">
                    Click to change your avatar
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full"
                onClick={() => navigate("/create")}
              >
                Upload New Cake
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
        
        {/* User Cakes Section */}
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-bold mb-2 sm:mb-0">Your Cake Creations</h2>
              
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
            
            {loadingCakes ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin text-4xl mb-4">🍰</div>
                <p>Loading your cakes...</p>
              </div>
            ) : userCakes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {userCakes.map((cake) => (
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
