import {
  useTranslation,
  useLanguage as useTranslationLanguage,
} from '@/contexts/TranslationContext';
import { useCallback } from 'react';
import type { Language } from '@/contexts/TranslationContext';

interface UseLanguageReturn {
  currentLanguage: Language;
  t: ReturnType<typeof useTranslation>['t'];
  changeLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  availableLanguages: Language[];
  isLanguageAvailable: (lang: string) => boolean;
  getText: (path: string) => string;
}

/**
 * Hook para gestionar el idioma en el ProfileHero
 * Proporciona funciones para cambiar idioma y verificar disponibilidad
 */
export function useLanguage(): UseLanguageReturn {
  const { t, getText } = useTranslation();
  const { language, setLanguage, toggleLanguage } = useTranslationLanguage();

  const availableLanguages: Language[] = ['es', 'en'];

  const changeLanguage = useCallback(
    (newLanguage: Language) => {
      if (availableLanguages.includes(newLanguage)) {
        setLanguage(newLanguage);
      }
    },
    [setLanguage]
  );

  const isLanguageAvailable = useCallback((lang: string): boolean => {
    return availableLanguages.includes(lang as Language);
  }, []);

  return {
    currentLanguage: language,
    t,
    changeLanguage,
    toggleLanguage,
    availableLanguages,
    isLanguageAvailable,
    getText,
  };
}
