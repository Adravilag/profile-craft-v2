// src/contexts/UnifiedThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Tipos unificados
export type Theme = 'light' | 'dark' | 'auto';
export type ReadingMode = 'normal' | 'focus' | 'minimal';

interface ThemePreferences {
  // Configuración global (para toda la aplicación)
  globalTheme: Theme;

  // Configuración de lectura (solo para artículos)
  readingMode: ReadingMode;
  fontSize: number; // 14-24px
  lineHeight: number; // 1.4-2.0
  maxWidth: number; // 600-1000px

  // Configuración de modo nocturno automático
  autoNightMode: boolean;
  nightModeStart: string; // "20:00"
  nightModeEnd: string; // "06:00"
}

export interface UnifiedThemeContextType {
  // Estado
  preferences: ThemePreferences;
  currentGlobalTheme: Exclude<Theme, 'auto'>;
  systemPrefersDark: boolean;
  isReadingMode: boolean;
  isTransitioning: boolean;

  // Métodos globales
  setGlobalTheme: (theme: Theme) => void;
  toggleGlobalTheme: () => void;

  // Métodos de lectura (para artículos)
  updateReadingPreference: <K extends keyof Omit<ThemePreferences, 'globalTheme'>>(
    key: K,
    value: ThemePreferences[K]
  ) => void;
  toggleReadingMode: () => void;

  // Utilidades
  resetToDefaults: () => void;
  exportPreferences: () => string;
  importPreferences: (data: string) => boolean;
}

const defaultPreferences: ThemePreferences = {
  globalTheme: 'auto',
  readingMode: 'normal',
  fontSize: 14,
  lineHeight: 1.6,
  maxWidth: 650,
  autoNightMode: true,
  nightModeStart: '20:00',
  nightModeEnd: '06:00',
};

const UnifiedThemeContext = createContext<UnifiedThemeContextType | undefined>(undefined);

export const useUnifiedTheme = () => {
  const context = useContext(UnifiedThemeContext);
  if (!context) {
    throw new Error('useUnifiedTheme must be used within a UnifiedThemeProvider');
  }
  return context;
};

interface UnifiedThemeProviderProps {
  children: ReactNode;
}

export const UnifiedThemeProvider: React.FC<UnifiedThemeProviderProps> = ({ children }) => {
  // Cargar preferencias desde localStorage
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    // Migrar datos existentes si existen
    const oldGlobalTheme = localStorage.getItem('cv-theme');
    const oldProjectPrefs = localStorage.getItem('project-theme-preferences');

    let migratedPrefs = { ...defaultPreferences };

    // Migrar tema global existente
    if (oldGlobalTheme && ['light', 'dark', 'auto'].includes(oldGlobalTheme)) {
      migratedPrefs.globalTheme = oldGlobalTheme as Theme;
    }

    // Migrar preferencias de artículos existentes
    if (oldProjectPrefs) {
      try {
        const parsed = JSON.parse(oldProjectPrefs);
        migratedPrefs = {
          ...migratedPrefs,
          readingMode: parsed.readingMode || 'normal',
          fontSize: parsed.fontSize || 18,
          lineHeight: parsed.lineHeight || 1.6,
          maxWidth: parsed.maxWidth || 650,
          autoNightMode: parsed.autoNightMode !== undefined ? parsed.autoNightMode : true,
          nightModeStart: parsed.nightModeStart || '20:00',
          nightModeEnd: parsed.nightModeEnd || '06:00',
        };
      } catch {
        // Si hay error al parsear, usar defaults
      }
    }

    // Intentar cargar configuración unificada guardada
    const unifiedPrefs = localStorage.getItem('unified-theme-preferences');
    if (unifiedPrefs) {
      try {
        return { ...migratedPrefs, ...JSON.parse(unifiedPrefs) };
      } catch {
        return migratedPrefs;
      }
    }

    return migratedPrefs;
  });
  // Estado del sistema
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Estado de transición para animaciones
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Función para determinar tema efectivo basado en preferencias
  const getEffectiveTheme = (themePreference: Theme): Exclude<Theme, 'auto'> => {
    if (themePreference !== 'auto') {
      return themePreference;
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
  // Tema efectivo actual
  const currentGlobalTheme = getEffectiveTheme(preferences.globalTheme);

  // Escuchar cambios en preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem('unified-theme-preferences', JSON.stringify(preferences));

    // Mantener compatibilidad con sistemas legacy: almacenar el tema efectivo
    localStorage.setItem('cv-theme', currentGlobalTheme);
    localStorage.setItem(
      'project-theme-preferences',
      JSON.stringify({
        readingMode: preferences.readingMode,
        fontSize: preferences.fontSize,
        lineHeight: preferences.lineHeight,
        maxWidth: preferences.maxWidth,
        autoNightMode: preferences.autoNightMode,
        nightModeStart: preferences.nightModeStart,
        nightModeEnd: preferences.nightModeEnd,
      })
    );
  }, [preferences]);
  // Aplicar estilos CSS al DOM con animaciones de transición
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Iniciar animación de transición
    setIsTransitioning(true);
    root.setAttribute('data-theme-transitioning', 'true');

    // Guardar preferencia en localStorage para compatibilidad (tema efectivo)
    localStorage.setItem('cv-theme', currentGlobalTheme);

    // Aplicar clases de modo para compatibilidad
    if (currentGlobalTheme === 'dark') {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    } // Aplicar tema global a elementos de artículos también
    body.classList.remove('project-theme-light', 'project-theme-dark', 'project-theme-sepia');
    body.classList.add(`project-theme-${currentGlobalTheme}`);

    // Asegurar que el atributo data-theme en el elemento raíz refleje el tema efectivo
    try {
      root.setAttribute('data-theme', currentGlobalTheme);
    } catch (e) {
      // Ignorar en entornos sin DOM
    }

    // Aplicar modo de lectura
    body.classList.remove('reading-mode-normal', 'reading-mode-focus', 'reading-mode-minimal');
    body.classList.add(`reading-mode-${preferences.readingMode}`);

    // Aplicar variables CSS personalizadas
    body.style.setProperty('--project-font-size', `${preferences.fontSize}px`);
    body.style.setProperty('--project-line-height', preferences.lineHeight.toString());
    body.style.setProperty('--project-max-width', `${preferences.maxWidth}px`);

    // Actualizar meta theme-color para navegadores móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentGlobalTheme === 'dark' ? '#101418' : '#fdfcff');
    }

    // Finalizar animación de transición después de la duración de la animación
    const transitionTimeout = setTimeout(() => {
      setIsTransitioning(false);
      root.removeAttribute('data-theme-transitioning');
    }, 600); // Duración igual a la animación CSS

    return () => clearTimeout(transitionTimeout);
  }, [currentGlobalTheme, preferences]);

  // Verificar modo nocturno automático cada minuto
  useEffect(() => {
    if (!preferences.autoNightMode) return;

    const interval = setInterval(() => {
      // Este efecto se dispara cuando cambian las preferencias,
      // lo que automáticamente recalcula los temas efectivos
      setPreferences(prev => ({ ...prev }));
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [preferences.autoNightMode, preferences.nightModeStart, preferences.nightModeEnd]);

  // Métodos del contexto
  const setGlobalTheme = (theme: Theme) => {
    setPreferences(prev => ({ ...prev, globalTheme: theme }));
  };
  const toggleGlobalTheme = () => {
    const newTheme = currentGlobalTheme === 'dark' ? 'light' : 'dark';
    setGlobalTheme(newTheme);
  };

  const updateReadingPreference = <K extends keyof Omit<ThemePreferences, 'globalTheme'>>(
    key: K,
    value: ThemePreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleReadingMode = () => {
    const modes: ReadingMode[] = ['normal', 'focus', 'minimal'];
    const currentIndex = modes.indexOf(preferences.readingMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updateReadingPreference('readingMode', nextMode);
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
  const value: UnifiedThemeContextType = {
    preferences,
    currentGlobalTheme,
    systemPrefersDark,
    isReadingMode: preferences.readingMode !== 'normal',
    isTransitioning,
    setGlobalTheme,
    toggleGlobalTheme,
    updateReadingPreference,
    toggleReadingMode,
    resetToDefaults,
    exportPreferences,
    importPreferences,
  };

  return <UnifiedThemeContext.Provider value={value}>{children}</UnifiedThemeContext.Provider>;
};
