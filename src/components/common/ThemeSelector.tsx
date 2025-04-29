
import React from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon, CircleHalf } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = "" }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, updateThemePreference } = useAuth();

  const handleThemeChange = async (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    
    // If user is logged in, save preference to database
    if (user) {
      await updateThemePreference(value);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Select
        defaultValue={theme}
        value={theme}
        onValueChange={handleThemeChange}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            {theme === 'light' && <Sun className="h-4 w-4" />}
            {theme === 'dark' && <Moon className="h-4 w-4" />}
            {theme === 'system' && <CircleHalf className="h-4 w-4" />}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light" className="flex items-center">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>{t("theme.light")}</span>
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>{t("theme.dark")}</span>
            </div>
          </SelectItem>
          <SelectItem value="system">
            <div className="flex items-center gap-2">
              <CircleHalf className="h-4 w-4" />
              <span>{t("theme.system")}</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ThemeSelector;
