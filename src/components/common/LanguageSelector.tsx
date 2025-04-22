
import React from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LanguageSelectorProps {
  showLabel?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  showLabel = true,
  className = ""
}) => {
  const { t, i18n } = useTranslation();
  const { user, updateLanguagePreference } = useAuth();

  // Get the current language
  const currentLanguage = i18n.language.split("-")[0];  // Handle cases like 'en-US'

  const handleLanguageChange = async (value: string) => {
    // Change the language in i18n
    i18n.changeLanguage(value);
    
    // If user is logged in, save preference to database
    if (user) {
      await updateLanguagePreference(value);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && <Label>{t("profile.language")}</Label>}
      <Select
        defaultValue={currentLanguage}
        value={currentLanguage}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t("profile.english")}</SelectItem>
          <SelectItem value="ua">{t("profile.ukrainian")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
