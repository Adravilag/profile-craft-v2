import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AboutSection from './AboutSection';

// Mock de los hooks y contextos
vi.mock('./hooks/useAboutSection', () => ({
  useAboutSection: () => ({
    aboutText: '<p>Texto de prueba</p>',
    highlights: [],
    collaborationNote: null,
    isLoading: false,
    hasError: false,
    errorMessage: null,
    isAnimated: true,
    elementRef: { current: null },
    handleNavigateToContact: vi.fn(),
  }),
}));

vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      about: {
        title: 'Acerca de',
        subtitle: 'Información personal',
        loadingInfo: 'Cargando...',
        errorLoading: 'Error al cargar',
        navigateToContact: 'Ir a contacto',
        collaborationTitle: 'Colaboración',
        collaborationDescription: 'Descripción de colaboración',
      },
      navigation: {
        home: 'Inicio',
        about: 'Acerca de',
      },
    },
  }),
}));

vi.mock('@/components/common/LanguageSelector/LanguageSelector', () => ({
  default: () => <div data-testid="language-selector">Language Selector</div>,
}));

vi.mock('@/components/common/TranslatedBreadcrumbs/TranslatedBreadcrumbs', () => ({
  default: () => <div data-testid="breadcrumbs">Breadcrumbs</div>,
}));

vi.mock('@/components/demo/TranslationDemo', () => ({
  default: () => <div data-testid="translation-demo">Translation Demo</div>,
}));

vi.mock('../../HeaderSection/HeaderSection', () => ({
  default: () => <div data-testid="header-section">Header Section</div>,
}));

describe('AboutSection', () => {
  describe('Demo de traducción removido', () => {
    it('no debe mostrar el demo de idiomas en posición fija', () => {
      render(<AboutSection />);

      // Verificar que no existe el contenedor de demo de idiomas
      const languageDemo = screen.queryByText('Language Demo:');
      expect(languageDemo).not.toBeInTheDocument();

      // Verificar que no hay múltiples selectores de idioma
      const languageSelectors = screen.queryAllByTestId('language-selector');
      expect(languageSelectors).toHaveLength(0);
    });

    it('no debe mostrar el componente TranslationDemo', () => {
      render(<AboutSection />);

      // Verificar que no existe el demo completo de traducciones
      const translationDemo = screen.queryByTestId('translation-demo');
      expect(translationDemo).not.toBeInTheDocument();
    });

    it('no debe mostrar los breadcrumbs', () => {
      render(<AboutSection />);

      // Verificar que no existe el componente de breadcrumbs
      const breadcrumbs = screen.queryByTestId('breadcrumbs');
      expect(breadcrumbs).not.toBeInTheDocument();
    });

    it('debe mantener las funcionalidades principales del componente', () => {
      render(<AboutSection />);

      // Verificar que los elementos principales siguen presentes (sin breadcrumbs)
      expect(screen.getByTestId('header-section')).toBeInTheDocument();
      expect(screen.getByText('Texto de prueba')).toBeInTheDocument();
    });
  });
});
