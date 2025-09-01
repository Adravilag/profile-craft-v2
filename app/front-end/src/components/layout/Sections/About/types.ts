import React from 'react';

/**
 * Tipo unificado para highlight cards que puede manejar tanto datos estáticos
 * como dinámicos de la API.
 */
export interface UnifiedHighlightCard {
  _id?: string;
  icon: React.ReactNode | string; // ReactNode para estático, string para dinámico
  title: string;
  descriptionHtml: string;
  tech: string;
  imageSrc: string;
}
