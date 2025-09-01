import { useData } from '@/contexts';

/**
 * Hook para manejar los datos del perfil en la sección About.
 * Centraliza el acceso a los datos del perfil y manejo de estados de carga/error.
 */
export function useAboutData() {
  const { profile, profileLoading, profileError } = useData();

  return {
    profile,
    profileLoading,
    profileError,
    hasProfile: Boolean(profile),
  };
}
