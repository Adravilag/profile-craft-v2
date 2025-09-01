// src/hooks/useLocalizedContent.ts
import { useMemo } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export interface LocalizedContent {
  es?: string;
  en?: string;
  default?: string;
}

export interface LocalizedContentObject {
  [key: string]: LocalizedContent | string;
}

/**
 * Hook para manejar contenido localizado que viene del backend
 * Permite trabajar con objetos que tienen contenido en múltiples idiomas
 */
export const useLocalizedContent = () => {
  const { language } = useTranslation();

  /**
   * Obtiene el texto en el idioma actual desde un objeto localizado
   */
  const getLocalizedText = useMemo(() => {
    return (content: LocalizedContent | string, fallback?: string): string => {
      if (typeof content === 'string') {
        return content;
      }

      if (!content) {
        return fallback || '';
      }

      // Prioridad: idioma actual > default > primer idioma disponible > fallback
      return (
        content[language] ||
        content.default ||
        content.es ||
        content.en ||
        Object.values(content).find(val => typeof val === 'string') ||
        fallback ||
        ''
      );
    };
  }, [language]);

  /**
   * Procesa un objeto completo con múltiples campos localizados
   */
  const processLocalizedObject = useMemo(() => {
    return <T extends LocalizedContentObject>(
      obj: T,
      fallbackValues?: Partial<Record<keyof T, string>>
    ): Record<keyof T, string> => {
      const result = {} as Record<keyof T, string>;

      Object.keys(obj).forEach(key => {
        const typedKey = key as keyof T;
        const content = obj[typedKey];
        const fallback = fallbackValues?.[typedKey];

        result[typedKey] = getLocalizedText(content as LocalizedContent, fallback);
      });

      return result;
    };
  }, [getLocalizedText]);

  /**
   * Verifica si un contenido localizado tiene traducción para el idioma actual
   */
  const hasTranslation = useMemo(() => {
    return (content: LocalizedContent | string): boolean => {
      if (typeof content === 'string') {
        return true;
      }

      if (!content) {
        return false;
      }

      return Boolean(content[language] || content.default);
    };
  }, [language]);

  /**
   * Obtiene todos los idiomas disponibles para un contenido
   */
  const getAvailableLanguages = useMemo(() => {
    return (content: LocalizedContent): string[] => {
      if (!content || typeof content === 'string') {
        return [];
      }

      return Object.keys(content).filter(
        key => key !== 'default' && content[key as keyof LocalizedContent]
      );
    };
  }, []);

  return {
    getLocalizedText,
    processLocalizedObject,
    hasTranslation,
    getAvailableLanguages,
    currentLanguage: language,
  };
};

// Hook específico para highlight cards con contenido localizado
export const useLocalizedHighlightCards = () => {
  const { getLocalizedText } = useLocalizedContent();

  const processHighlightCard = useMemo(() => {
    return (card: any) => ({
      ...card,
      title: getLocalizedText(card.title, card.title),
      descriptionHtml: getLocalizedText(card.descriptionHtml, card.descriptionHtml),
      tech: getLocalizedText(card.tech, card.tech),
    });
  }, [getLocalizedText]);

  return { processHighlightCard };
};
