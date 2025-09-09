import { useUnifiedTheme } from '../../../../../contexts/UnifiedThemeContext';
import { useCallback } from 'react';
import type { Theme } from '../../../../../contexts/UnifiedThemeContext';

interface UseThemeManagerReturn {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  getThemeIcon: () => string;
  getThemeLabel: () => string;
}

/**
 * Hook para gestionar el tema en el ProfileHero
 * Proporciona funciones para cambiar tema y obtener información del tema actual
 */
export function useThemeManager(): UseThemeManagerReturn {
  const { preferences, currentGlobalTheme, setGlobalTheme } = useUnifiedTheme();

  const isDark = currentGlobalTheme === 'dark';

  const setTheme = useCallback(
    (theme: Theme) => {
      setGlobalTheme(theme);
    },
    [setGlobalTheme]
  );

  const getThemeIcon = useCallback(() => {
    // Solo modo oscuro disponible
    return '🌙';
  }, []);

  const getThemeLabel = useCallback(() => {
    // Solo modo oscuro disponible
    return 'Modo oscuro';
  }, []);

  return {
    theme: preferences.globalTheme,
    currentTheme: currentGlobalTheme,
    isDark,
    setTheme,
    getThemeIcon,
    getThemeLabel,
  };
}
