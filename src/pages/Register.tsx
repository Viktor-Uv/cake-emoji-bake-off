import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { EMOJI_OPTIONS } from "@/constants/emoji-constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmojiPicker from "@/components/EmojiPicker";

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(
    EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)]
  );
  
  const { signUp, signInWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, displayName, selectedEmoji);
      navigate("/profile");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      navigate("/profile");
    } catch (error) {
      console.error("Google authentication error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <span className="text-3xl">🎂</span>
            {t("auth.createAccountTitle")}
          </CardTitle>
          <CardDescription>
            {t("auth.createAccountDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t("auth.displayName")}</Label>
              <Input
                id="displayName"
                placeholder={t("auth.yourName")}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("auth.chooseAvatar")}</Label>
              <div className="flex justify-center">
                <EmojiPicker
                  value={selectedEmoji}
                  onChange={setSelectedEmoji}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                placeholder="your.email@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.creatingAccount") : t("auth.createAccountButton")}
            </Button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("auth.orContinueWith")}
              </span>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              {t("auth.signInWithGoogle")}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-center text-gray-500 mt-2">
            {t("auth.hasAccount")}{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => navigate("/login")}
            >
              {t("auth.signIn")}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
