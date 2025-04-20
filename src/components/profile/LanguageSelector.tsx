
import React from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  // Get the current language when the component mounts
  const currentLanguage = i18n.language.split("-")[0];  // Handle cases like 'en-US'

  return (
    <div className="space-y-2">
      <Label>{t("profile.language")}</Label>
      <Select
        defaultValue={currentLanguage}
        value={currentLanguage}
        onValueChange={(value) => i18n.changeLanguage(value)}
      >
        <SelectTrigger>
          <SelectValue />
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
