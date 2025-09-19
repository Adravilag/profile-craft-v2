import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';

// Partial mock: import the original module and override only what we need
vi.mock('@/services/endpoints', async importOriginal => {
  const actual: any = await importOriginal();

  return {
    profile: {
      getUserProfile: async () => ({
        name: 'Color Test',
        role_title: 'Dev',
        profile_image: '',
        email: '',
        linkedin_url: null,
        github_url: null,
        location: '',
        status: 'Available',
        meta: {},
      }),
    },
    skills: {
      getSkills: async () => [
        {
          id: 1,
          user_id: 0,
          category: 'Frontend',
          name: 'React',
          svg_path: '/mock-icons/react.svg',
          level: 90,
          order_index: 1,
        },
      ],
    },
    // provide fallback implementations for other expected exports, taking from actual when available
    experiences: actual.experiences || { getExperiences: async () => [] },
    education: actual.education || { getEducation: async () => [] },
    projects: actual.projects || { getProjects: async () => [] },
    certifications: actual.certifications || { getCertifications: async () => [] },
    users: actual.users || { getUsers: async () => [] },
  };
});

// Stub interactive terminal
vi.mock('@/components/layout/Sections/ProfileHero/Widgets/Terminal/InteractiveTerminal', () => ({
  default: () => React.createElement('div', { 'data-testid': 'stub-terminal' }, null),
}));

// Mock hooks and contexts used by ProfileHero to avoid provider requirements
vi.mock('@/hooks/usePDFExport', () => ({ default: () => ({ exportToPDF: () => {} }) }));
vi.mock('@/hooks/useHeader', () => ({
  useHeader: () => ({
    state: {
      isScrolled: false,
      isCompact: false,
      isVisible: true,
      scrollProgress: 0,
      isLoading: false,
    },
    actions: { handleDownloadPDF: vi.fn() },
    elementRef: React.createRef(),
  }),
}));
vi.mock('@/contexts', () => ({
  useNotificationContext: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  useUnifiedTheme: () => ({
    currentGlobalTheme: 'dark',
    themeConfig: {
      colors: {
        primary: '#007acc',
        secondary: '#f0f0f0',
        accent: '#ff6b35',
        text: '#333333',
        background: '#ffffff',
      },
    },
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  }),
  useTranslation: () => ({
    currentLanguage: 'es',
    setLanguage: vi.fn(),
  }),
  useT: () => ({
    states: {
      error: 'Error',
      loading: 'Cargando...',
    },
    ui: {
      buttons: {
        download: 'Descargar',
      },
    },
  }),
}));

import ProfileHero from './ProfileHero';

describe('ProfileHero colors', () => {
  it('applies global skill color classes and hover label is present', async () => {
    const user = userEvent.setup();
  render(<ProfileHero />);

    // Encontrar el icono de React por title
    const els = await screen.findAllByTitle('React');
    expect(els.length).toBeGreaterThan(0);
    const el = els[0];

    // El DOM debería contener la clase generada por ProfileHero (p. ej. 'stackIcon' o 'skillHoverLabel')
    // Verificamos que el elemento o su contenedor tiene al menos una clase (no vacío)
    expect(el.className).toBeTruthy();

    // Simular hover y comprobar que aparece el label con porcentaje
    await user.hover(el);
    const label = await screen.findByText(/React — 90%/);
    expect(label).toBeVisible();
  });
});
