
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EMOJI_OPTIONS } from "@/constants/emoji-constants";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "@/components/EmojiPicker";
import { Input } from "@/components/ui/input";

const Profile: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  
  // This is just a placeholder for avatar updates
  // In a real app, you'd implement avatar updating logic
  const handleAvatarChange = (emoji: string) => {
    console.log("Selected emoji:", emoji);
    // This would update the user's avatar in the database
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
    <div className="max-w-md mx-auto p-4">
      <div className="flex flex-col items-center mb-8">
        <div className="text-6xl mb-4">{user.emojiAvatar}</div>
        <h1 className="text-2xl font-bold">{user.displayName || "Cake Baker"}</h1>
        <p className="text-gray-600">{user.email}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Your Profile</h2>
        
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
              <span className="text-sm text-gray-500">
                Click to change your avatar (demo only)
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Button 
          className="w-full"
          onClick={() => navigate("/create")}
        >
          Upload New Cake
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={signOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
