import { useEffect, useState } from 'react';

import { Language } from '@/src/localization/i18n';
import { ThemeMode } from '@/src/models/types';
import { getItem, setItem } from '@/src/storage/localStore';

const THEME_KEY = 'pref_theme';
const LANG_KEY = 'pref_lang';

export function useAppPreferences() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    (async () => {
      const t = await getItem(THEME_KEY);
      const l = await getItem(LANG_KEY);
      if (t === 'dark' || t === 'light') setTheme(t);
      if (l === 'ru' || l === 'en') setLanguage(l);
    })();
  }, []);

  const updateTheme = async (next: ThemeMode) => {
    setTheme(next);
    await setItem(THEME_KEY, next);
  };

  const updateLanguage = async (next: Language) => {
    setLanguage(next);
    await setItem(LANG_KEY, next);
  };

  return { theme, language, updateTheme, updateLanguage };
}
