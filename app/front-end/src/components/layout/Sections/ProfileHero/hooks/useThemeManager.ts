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
    switch (preferences.globalTheme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🔄';
      default:
        return '🌙';
    }
  }, [preferences.globalTheme]);

  const getThemeLabel = useCallback(() => {
    switch (preferences.globalTheme) {
      case 'light':
        return 'Modo claro';
      case 'dark':
        return 'Modo oscuro';
      case 'auto':
        return 'Automático';
      default:
        return 'Modo oscuro';
    }
  }, [preferences.globalTheme]);

  return {
    theme: preferences.globalTheme,
    currentTheme: currentGlobalTheme,
    isDark,
    setTheme,
    getThemeIcon,
    getThemeLabel,
  };
}
