// useAppPreferences.ts
import { Language } from "@/src/localization/i18n";
import { ThemeMode } from "@/src/models/types";
import {
  loadLanguage,
  loadTheme,
  saveLanguage,
  saveTheme,
} from "@/src/storage/prefStorage";
import { useEffect, useState } from "react";

export function useAppPreferences() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [language, setLanguage] = useState<Language>("ru");

  useEffect(() => {
    (async () => {
      const savedTheme = await loadTheme();
      if (savedTheme) setTheme(savedTheme);
      const savedLang = await loadLanguage();
      if (savedLang) setLanguage(savedLang);
    })();
  }, []);

  const updateTheme = async (next: ThemeMode) => {
    setTheme(next);
    await saveTheme(next);
  };

  const updateLanguage = async (next: Language) => {
    setLanguage(next);
    await saveLanguage(next);
  };

  return { theme, language, updateTheme, updateLanguage };
}
