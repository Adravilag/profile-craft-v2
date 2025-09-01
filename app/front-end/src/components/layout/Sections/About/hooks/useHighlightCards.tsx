import React, { useMemo } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export interface HighlightCardData {
  icon: React.ReactNode;
  title: string;
  descriptionHtml: string;
  tech: string;
  imageSrc: string;
}

export function useHighlightCards() {
  const { t } = useTranslation();

  const highlightCards = useMemo((): HighlightCardData[] => {
    const cardsFromT = (t.about as any)?.highlightCards;
    if (Array.isArray(cardsFromT) && cardsFromT.length > 0) {
      return cardsFromT.map((c: any, i: number) => ({
        icon: [<i key={`icon-${i}`} className="fas fa-laptop-code" />],
        title: c.title,
        descriptionHtml: c.descriptionHtml,
        tech: c.tech,
        imageSrc: c.imageSrc,
      })) as unknown as HighlightCardData[];
    }

    // Fallback: minimal empty list
    return [];
  }, [t]);

  return { highlightCards };
}
