// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ProjectTheme = 'light' | 'dark' | 'sepia' | 'auto';
export type ReadingMode = 'normal' | 'focus' | 'minimal';

interface ThemePreferences {
  theme: ProjectTheme;
  readingMode: ReadingMode;
  fontSize: number; // 14-24px
  lineHeight: number; // 1.4-2.0
  maxWidth: number; // 600-1000px
  autoNightMode: boolean;
  nightModeStart: string; // "20:00"
  nightModeEnd: string; // "06:00"
}

interface ThemeContextType {
  preferences: ThemePreferences;
  currentTheme: Exclude<ProjectTheme, 'auto'>;
  isReadingMode: boolean;
  updatePreference: <K extends keyof ThemePreferences>(key: K, value: ThemePreferences[K]) => void;
  toggleReadingMode: () => void;
  resetToDefaults: () => void;
  exportPreferences: () => string;
  importPreferences: (data: string) => boolean;
}

const defaultPreferences: ThemePreferences = {
  theme: 'auto',
  readingMode: 'normal',
  fontSize: 18,
  lineHeight: 1.6,
  maxWidth: 650,
  autoNightMode: true,
  nightModeStart: '20:00',
  nightModeEnd: '06:00',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    const saved = localStorage.getItem('project-theme-preferences');
    if (saved) {
      try {
        return { ...defaultPreferences, ...JSON.parse(saved) };
      } catch {
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Flag para prevenir bucles infinitos
  const [isEmittingEvent, setIsEmittingEvent] = useState(false);

  // Determinar tema actual
  const getCurrentTheme = (): Exclude<ProjectTheme, 'auto'> => {
    if (preferences.theme !== 'auto') {
      return preferences.theme;
    }

    // Modo automático: priorizar tema global del sistema de CV si existe
    const globalThemePreference = localStorage.getItem('cv-theme');
    if (globalThemePreference && globalThemePreference !== 'auto') {
      if (globalThemePreference === 'light' || globalThemePreference === 'dark') {
        return globalThemePreference;
      }
    }

    // Modo automático con horario nocturno
    if (preferences.autoNightMode) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      if (currentTime >= preferences.nightModeStart || currentTime <= preferences.nightModeEnd) {
        return 'dark';
      }
    }

    return systemPrefersDark ? 'dark' : 'light';
  };

  const [currentTheme, setCurrentTheme] = useState<Exclude<ProjectTheme, 'auto'>>(getCurrentTheme);

  // Sincronización simplificada con localStorage
  useEffect(() => {
    const checkGlobalThemeChange = () => {
      if (preferences.theme === 'auto') {
        const newTheme = getCurrentTheme();
        if (newTheme !== currentTheme) {
          setCurrentTheme(newTheme);
        }
      }
    };

    // Verificar cambios cada 500ms
    const interval = setInterval(checkGlobalThemeChange, 500);

    return () => clearInterval(interval);
  }, [preferences.theme, currentTheme]);

  // Escuchar cambios en preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Actualizar tema cuando cambien las preferencias del sistema
  useEffect(() => {
    if (preferences.theme === 'auto') {
      const newTheme = getCurrentTheme();
      setCurrentTheme(newTheme);
    }
  }, [preferences, systemPrefersDark]);

  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem('project-theme-preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Aplicar estilos CSS al body
  useEffect(() => {
    const body = document.body;

    // Limpiar clases anteriores
    body.classList.remove('project-theme-light', 'project-theme-dark', 'project-theme-sepia');
    body.classList.remove('reading-mode-normal', 'reading-mode-focus', 'reading-mode-minimal');

    // Aplicar tema actual
    body.classList.add(`project-theme-${currentTheme}`);
    body.classList.add(`reading-mode-${preferences.readingMode}`);

    // Aplicar variables CSS personalizadas
    body.style.setProperty('--project-font-size', `${preferences.fontSize}px`);
    body.style.setProperty('--project-line-height', preferences.lineHeight.toString());
    body.style.setProperty('--project-max-width', `${preferences.maxWidth}px`);

    // Sincronizar con el sistema global de temas (guardar preferencia pero no tocar DOM)
    localStorage.setItem('cv-theme', currentTheme);

    // Disparar evento personalizado para notificar el cambio de tema al sistema global
    // Solo si no estamos en medio de emitir un evento para evitar bucles
    if (!isEmittingEvent) {
      setIsEmittingEvent(true);
      const themeChangeEvent = new CustomEvent('themeChange', {
        detail: { theme: currentTheme },
      });
      window.dispatchEvent(themeChangeEvent);

      // Reset flag después de un breve delay
      setTimeout(() => setIsEmittingEvent(false), 100);
    }
  }, [currentTheme, preferences]);

  // Verificar modo nocturno automático cada minuto
  useEffect(() => {
    if (!preferences.autoNightMode || preferences.theme !== 'auto') return;

    const interval = setInterval(() => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
      }
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [
    preferences.autoNightMode,
    preferences.theme,
    preferences.nightModeStart,
    preferences.nightModeEnd,
    currentTheme,
  ]);

  const updatePreference = <K extends keyof ThemePreferences>(
    key: K,
    value: ThemePreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));

    // Si el usuario cambió el tema manualmente (no auto), sincronizar con el sistema global
    if (key === 'theme' && value !== 'auto') {
      const newTheme = value as Exclude<ProjectTheme, 'auto'>;
      if (newTheme === 'light' || newTheme === 'dark') {
        localStorage.setItem('cv-theme', newTheme);

        // Emitir evento para notificar al sistema global
        const syncEvent = new CustomEvent('projectThemeSync', {
          detail: { theme: newTheme },
        });
        window.dispatchEvent(syncEvent);
      }
    }
  };

  const toggleReadingMode = () => {
    const modes: ReadingMode[] = ['normal', 'focus', 'minimal'];
    const currentIndex = modes.indexOf(preferences.readingMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updatePreference('readingMode', nextMode);
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
  };

  const exportPreferences = (): string => {
    return JSON.stringify(preferences, null, 2);
  };

  const importPreferences = (data: string): boolean => {
    try {
      const imported = JSON.parse(data);
      const merged = { ...defaultPreferences, ...imported };
      setPreferences(merged);
      return true;
    } catch {
      return false;
    }
  };

  const value: ThemeContextType = {
    preferences,
    currentTheme,
    isReadingMode: preferences.readingMode !== 'normal',
    updatePreference,
    toggleReadingMode,
    resetToDefaults,
    exportPreferences,
    importPreferences,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
