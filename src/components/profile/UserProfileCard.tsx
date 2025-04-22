import React, { useState } from "react";
import { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmojiPicker from "@/components/EmojiPicker";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription,
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateDisplayName, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user.displayName);

  const handleUpdateDisplayName = async () => {
    if (newDisplayName.trim() === "") return;
    const success = await updateDisplayName(newDisplayName.trim());
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col items-center mb-6">
        <div className="text-6xl mb-4">{user.emojiAvatar}</div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-48"
              />
              <Button size="sm" onClick={handleUpdateDisplayName}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => {
                setNewDisplayName(user.displayName);
                setIsEditing(false);
              }}>Cancel</Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold">{user.displayName}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                {t("common.edit")}
              </Button>
            </>
          )}
        </div>
        <p className="text-gray-600 text-sm">{user.email}</p>
        {user.createdAt && (
          <p className="text-gray-500 text-xs mt-1">
            {t("profile.memberSince")}{' '} {format(user.createdAt.toDate(), "MMM d, yyyy")}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t("auth.email")}</label>
          <Input value={user.email} disabled/>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t("profile.emojiAvatar")}</label>
          <div className="flex items-center gap-4">
            <EmojiPicker
              value={user.emojiAvatar}
              onChange={onAvatarChange}
            />
            <span className="text-xs text-gray-500">
              {t("profile.changeAvatar")}
            </span>
          </div>
        </div>

        <LanguageSelector />
      </div>

      <div className="mt-6 space-y-2">
        <Button
          className="w-full"
          onClick={() => navigate("/create")}
        >
          {t("profile.uploadNewCake")}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={onSignOut}
        >
          {t("common.signOut")}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
            >
              {t("profile.deleteAccount")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("auth.deleteAccountWarning")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("auth.deleteAccountDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("auth.deleteAccountTitle")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UserProfileCard;
