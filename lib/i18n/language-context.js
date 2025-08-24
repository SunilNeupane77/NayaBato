'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getTranslation } from './translations';

// Create context
export const LanguageContext = createContext({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Provider component
export const LanguageProvider = ({ children }) => {
  // Initialize with browser language or saved preference, defaulting to English
  const [locale, setLocale] = useState('en');
  
  useEffect(() => {
    // Get saved language preference from localStorage if available
    const savedLocale = localStorage.getItem('nayabato-locale');
    
    if (savedLocale) {
      setLocale(savedLocale);
    } else {
      // Check for browser language preference
      const browserLang = navigator.language;
      
      // If browser language is Nepali, set to Nepali
      if (browserLang.startsWith('ne')) {
        setLocale('ne');
      }
    }
  }, []);
  
  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('nayabato-locale', locale);
    // Update HTML lang attribute
    document.documentElement.lang = locale;
  }, [locale]);
  
  // Translation function
  const t = (key) => {
    return getTranslation(locale, key);
  };
  
  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
