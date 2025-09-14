import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';

// Tipos y Servicios
import type { UserProfile } from '@/types/api';
import { profile as profileApi, auth as authApi } from '@/services/endpoints';
import { debugLog } from '@/utils/debugConfig';

// Hooks especializados
import { useAutoNavigation } from './useAutoNavigation';
import { useAppLoadingState } from './useAppLoadingState';
import { useFABActions } from './useFABActions';
import { useContactForm } from './useContactForm';
import { useNavItems } from './useNavItems';

// --- Definiciones de Tipos Locales ---

// Forma de una acción para el FAB, mantenida localmente para consistencia.
type LocalFABAction = {
  id: string;
  onClick: () => void | Promise<void>;
  icon: string;
  label: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
};

// --- Props y Valor de Retorno del Hook ---

/**
 * Dependencias que el hook `useRootLayout` necesita desde los contextos de React.
 */
interface UseRootLayoutProps {
  isAuthenticated: boolean;
  currentSection?: string;
  initialSection?: string;
  navigateToSection: (section: string) => void;
  notifySuccess: (title: string, message?: string) => void;
  notifyError: (title: string, message?: string) => void;
}

/**
 * Valores que el hook `useRootLayout` expone al componente.
 */
interface UseRootLayoutReturn {
  profile: UserProfile | null;
  isCheckingUsers: boolean;
  navItems: { id: string; label: string; icon: string }[];
  handleContactSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  testimonialsFABActions: LocalFABAction[];
  skillsFABActions: LocalFABAction[];
  projectsFABActions: LocalFABAction[];
  experienceFABActions: LocalFABAction[];
  aboutFABActions: LocalFABAction[];
}

/**
 * Hook personalizado para centralizar la lógica de estado y efectos del RootLayout.
 *
 * Responsabilidades:
 * - Verificar si existen usuarios y cargar el perfil del usuario.
 * - Gestionar un estado de carga global (`isCheckingUsers`) y aplicarlo al DOM.
 * - Proveer la lista de items de navegación.
 * - Delegar manejo de formulario de contacto a hook especializado.
 * - Delegar acciones de FAB a hook especializado.
 * - Delegar navegación automática a hook especializado.
 *
 * @param props - Dependencias inyectadas desde los contextos (Auth, Navigation, Notification).
 * @returns El estado y los manejadores necesarios para el componente `RootLayoutContent`.
 */
export const useRootLayout = ({
  isAuthenticated,
  currentSection = '',
  initialSection,
  navigateToSection,
  notifySuccess,
  notifyError,
}: UseRootLayoutProps): UseRootLayoutReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isCheckingUsers, setIsCheckingUsers] = useState(true);
  const location = useLocation();

  // Usar hooks especializados
  useAutoNavigation(initialSection, currentSection, navigateToSection);

  // Evitamos activar el loading global (atributo data-app-loading) en la
  // carga inicial cuando el usuario entra en la raíz `/` y no hay
  // `initialSection` especificada. Esto permite que la primera sección
  // se muestre sin el spinner global en `http://localhost:5173`.
  const shouldUseGlobalLoading = (() => {
    try {
      // Si hay una sección inicial explícita o no estamos en la ruta raíz,
      // respetamos el estado de carga.
      if (initialSection) return true;
      if (location && location.pathname && location.pathname !== '/') return true;
      // Si estamos exactamente en `/` y no hay initialSection, no usar loading global.
      return false;
    } catch (err) {
      // En caso de error, caemos a la opción conservadora y mostramos el loading.
      return true;
    }
  })();

  useAppLoadingState(shouldUseGlobalLoading ? isCheckingUsers : false);

  const { navItems } = useNavItems({ isCheckingUsers });
  const { handleContactSubmit } = useContactForm();
  const {
    testimonialsFABActions,
    skillsFABActions,
    projectsFABActions,
    experienceFABActions,
    aboutFABActions,
  } = useFABActions({
    isAuthenticated,
    currentSection: currentSection || '',
  });

  // Efecto para la carga inicial de datos (perfil y estado de usuarios)
  useEffect(() => {
    const checkAndLoadProfile = async () => {
      try {
        setIsCheckingUsers(true);
        // Primero, verificamos si hay algún usuario registrado en el sistema.
        const userExists = await authApi.hasRegisteredUser();
        if (userExists) {
          // Si existe, cargamos el perfil público.
          const userProfile = await profileApi.getUserProfile();
          setProfile(userProfile);
        }
      } catch (error) {
        debugLog.error('❌ Error en la verificación de usuarios o carga de perfil:', error);
        setProfile(null); // Aseguramos que el perfil sea nulo en caso de error.
      } finally {
        setIsCheckingUsers(false);
      }
    };

    checkAndLoadProfile();
  }, []); // Se ejecuta solo una vez al montar el componente.

  return {
    profile,
    isCheckingUsers,
    navItems,
    handleContactSubmit,
    testimonialsFABActions,
    skillsFABActions,
    projectsFABActions,
    experienceFABActions,
    aboutFABActions,
  };
};
