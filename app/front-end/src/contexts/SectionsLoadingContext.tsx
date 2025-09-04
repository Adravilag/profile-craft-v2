/**
 * [IMPLEMENTACION] SectionsLoadingContext - Contexto global para loading de secciones
 *
 * Contexto React que provee el estado de loading centralizado
 * para todas las secciones de la aplicación.
 */

import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useSectionsLoading } from '@/hooks/useSectionsLoading';
import type { UseSectionsLoadingReturn } from '@/hooks/useSectionsLoading';

interface SectionsLoadingContextProps {
  children: ReactNode;
}

// Crear el contexto
const SectionsLoadingContext = createContext<UseSectionsLoadingReturn | undefined>(undefined);

/**
 * Provider que envuelve la aplicación y provee el estado de loading centralizado.
 */
export const SectionsLoadingProvider: React.FC<SectionsLoadingContextProps> = ({ children }) => {
  const sectionsLoading = useSectionsLoading();

  return (
    <SectionsLoadingContext.Provider value={sectionsLoading}>
      {children}
    </SectionsLoadingContext.Provider>
  );
};

/**
 * Hook para usar el contexto de loading de secciones.
 * Debe ser usado dentro de un SectionsLoadingProvider.
 */
export const useSectionsLoadingContext = (): UseSectionsLoadingReturn => {
  const context = useContext(SectionsLoadingContext);

  if (context === undefined) {
    throw new Error('useSectionsLoadingContext must be used within a SectionsLoadingProvider');
  }

  return context;
};
