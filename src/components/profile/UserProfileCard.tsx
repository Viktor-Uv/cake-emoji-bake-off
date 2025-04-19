
import React from "react";
import { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmojiPicker from "@/components/EmojiPicker";
import { useNavigate } from "react-router-dom";

interface UserProfileCardProps {
  user: User;
  onAvatarChange: (emoji: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  onAvatarChange,
  onSignOut,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col items-center mb-6">
        <div className="text-6xl mb-4">{user.emojiAvatar}</div>
        <h1 className="text-xl font-bold">{user.displayName}</h1>
        <p className="text-gray-600 text-sm">{user.email}</p>
        {user.createdAt && (
          <p className="text-gray-500 text-xs mt-1">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Display Name</label>
          <Input value={user.displayName} disabled />
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
              onChange={onAvatarChange} 
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
          onClick={onSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default UserProfileCard;
