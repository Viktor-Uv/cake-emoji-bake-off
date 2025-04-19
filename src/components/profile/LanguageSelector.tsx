
import React from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  return (
    <FormItem>
      <FormLabel>{t("profile.language")}</FormLabel>
      <FormControl>
        <Select
          value={i18n.language}
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
      </FormControl>
    </FormItem>
  );
};

export default LanguageSelector;
