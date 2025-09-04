import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SkillsFilterProvider } from '@/features/skills';

// Mock de contextos y hooks
vi.mock('@/contexts/UnifiedThemeContext', () => ({
  useTheme: () => ({ theme: 'dark' }),
}));

vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: {
      navigation: { skills: 'Habilidades' },
      sections: {
        skills: {
          title: 'Habilidades Técnicas',
          subtitle: 'Tecnologías y herramientas que domino',
        },
      },
    },
  }),
}));

// Mock del hook que usa useLocation
vi.mock('@/hooks/useIsOnSkillsPage', () => ({
  default: () => true,
  useIsOnSkillsPage: () => true,
}));

vi.mock('@/features/skills/hooks/useSkillsSectionLogic', () => ({
  useSkillsSectionLogic: () => ({
    skillsData: [],
    loading: false,
    error: null,
    hasData: false,
    showingAll: false,
    setShowingAll: vi.fn(),
    selectedCategory: null,
    setSelectedCategory: vi.fn(),
    availableCategories: [],
    refreshSkills: vi.fn(),
  }),
}));

vi.mock('@/features/skills/hooks/useFilterFAB', () => ({
  useFilterFAB: () => ({
    showFilterFAB: false,
    fabPosition: { x: 0, y: 0 },
    isFilterOpen: false,
    setIsFilterOpen: vi.fn(),
    selectedCategories: [],
    toggleCategory: vi.fn(),
    clearFilters: vi.fn(),
    applyFilters: vi.fn(),
    availableCategories: [],
  }),
}));

import SkillsSection from './SkillsSection';

describe('SkillsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not have undefined CSS classes', () => {
    const { container } = render(
      <BrowserRouter>
        <SkillsFilterProvider>
          <SkillsSection />
        </SkillsFilterProvider>
      </BrowserRouter>
    );

    // Verificar que no hay clases undefined en el HTML
    const htmlContent = container.innerHTML;
    expect(htmlContent).not.toContain('undefined');

    // Verificar que la sección principal tiene las clases correctas
    const section = container.querySelector('#skills');
    expect(section).toBeInTheDocument();
    expect(section?.className).toContain('section-cv');
    expect(section?.className).not.toContain('undefined');
  });

  it('should use correct CSS module classes', () => {
    const { container } = render(
      <BrowserRouter>
        <SkillsFilterProvider>
          <SkillsSection />
        </SkillsFilterProvider>
      </BrowserRouter>
    );

    // Buscar elementos con clases de CSS Modules
    const elementsWithStyles = container.querySelectorAll('[class*="SkillsSection-module"]');

    // Verificar que no hay clases undefined
    elementsWithStyles.forEach(element => {
      expect(element.className).not.toContain('undefined');
    });
  });
});
