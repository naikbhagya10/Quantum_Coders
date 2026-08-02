import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();
const STORAGE_KEY = 'mediclear_language';
const SUPPORTED_LANGUAGES = ['English', 'Kannada', 'Hindi'];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && SUPPORTED_LANGUAGES.includes(saved) ? saved : 'English';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (selectedLanguage) => {
    if (SUPPORTED_LANGUAGES.includes(selectedLanguage)) {
      setLanguageState(selectedLanguage);
    }
  };

  const t = (key, fallback = '') => {
    const keys = key.split('.');
    const resolveValue = (source) => {
      let current = source;
      for (const segment of keys) {
        if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
          current = current[segment];
        } else {
          return undefined;
        }
      }
      return current;
    };

    const currentValue = resolveValue(translations[language]);
    if (currentValue !== undefined && currentValue !== null) {
      return currentValue;
    }

    const englishValue = resolveValue(translations.English);
    return englishValue ?? fallback ?? key;
  };

  const value = useMemo(
    () => ({ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
