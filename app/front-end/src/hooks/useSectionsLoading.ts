/**
 * [IMPLEMENTACION] useSectionsLoading - Hook centralizado para manejo de loading
 *
 * Hook que centraliza el estado de loading de todas las secciones de la aplicación
 * para evitar duplicación de lógica y facilitar el debugging.
 */

import { useState, useCallback } from 'react';

export type SectionName =
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'certifications'
  | 'testimonials'
  | 'contact'
  | 'profile';

type LoadingState = Record<SectionName, boolean>;

export interface UseSectionsLoadingReturn {
  isLoading: (section: SectionName) => boolean;
  setLoading: (section: SectionName, loading: boolean) => void;
  isAnyLoading: () => boolean;
  getLoadingSections: () => SectionName[];
  resetAllLoading: () => void;
  setMultipleLoading: (sections: SectionName[], loading: boolean) => void;
  getLoadingState: () => LoadingState;
}

const initialState: LoadingState = {
  about: false,
  skills: false,
  experience: false,
  projects: false,
  certifications: false,
  testimonials: false,
  contact: false,
  profile: false,
};

/**
 * Hook centralizado para manejar el estado de loading de todas las secciones.
 *
 * @returns Funciones y estado para manejar loading de secciones
 */
export const useSectionsLoading = (): UseSectionsLoadingReturn => {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialState);

  const isLoading = useCallback(
    (section: SectionName): boolean => {
      return loadingState[section];
    },
    [loadingState]
  );

  const setLoading = useCallback((section: SectionName, loading: boolean): void => {
    setLoadingState(prev => ({
      ...prev,
      [section]: loading,
    }));
  }, []);

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingState).some(loading => loading);
  }, [loadingState]);

  const getLoadingSections = useCallback((): SectionName[] => {
    return Object.entries(loadingState)
      .filter(([, loading]) => loading)
      .map(([section]) => section as SectionName);
  }, [loadingState]);

  const resetAllLoading = useCallback((): void => {
    setLoadingState(initialState);
  }, []);

  const setMultipleLoading = useCallback((sections: SectionName[], loading: boolean): void => {
    setLoadingState(prev => {
      const newState = { ...prev };
      sections.forEach(section => {
        newState[section] = loading;
      });
      return newState;
    });
  }, []);

  const getLoadingState = useCallback((): LoadingState => {
    return { ...loadingState };
  }, [loadingState]);

  return {
    isLoading,
    setLoading,
    isAnyLoading,
    getLoadingSections,
    resetAllLoading,
    setMultipleLoading,
    getLoadingState,
  };
};
