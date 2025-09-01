import { useState, useEffect } from 'react';
import { getAboutSection } from '@/services/endpoints/about';
import type { AboutSectionData } from '@/services/endpoints/about';

interface UseAboutApiDataReturn {
  aboutData: AboutSectionData | null;
  aboutLoading: boolean;
  aboutError: string | null;
  hasAboutData: boolean;
  refetchAboutData: () => Promise<void>;
}

/**
 * Hook para manejar los datos de la sección About desde la API de MongoDB.
 * Gestiona la carga de datos, estados de loading/error y refetch.
 */
export function useAboutApiData(): UseAboutApiDataReturn {
  const [aboutData, setAboutData] = useState<AboutSectionData | null>(null);
  const [aboutLoading, setAboutLoading] = useState<boolean>(true);
  const [aboutError, setAboutError] = useState<string | null>(null);

  const fetchAboutData = async () => {
    try {
      setAboutLoading(true);
      setAboutError(null);

      const response = await getAboutSection();

      if (response.success) {
        setAboutData(response.data);
      } else {
        setAboutError(response.message || 'Error al cargar los datos de About');
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      setAboutError(
        error instanceof Error ? error.message : 'Error desconocido al cargar los datos de About'
      );
    } finally {
      setAboutLoading(false);
    }
  };

  const refetchAboutData = async () => {
    await fetchAboutData();
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  return {
    aboutData,
    aboutLoading,
    aboutError,
    hasAboutData: Boolean(aboutData),
    refetchAboutData,
  };
}
