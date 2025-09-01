import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';

// Provide a full mock for endpoints (use importOriginal to avoid breaking other imports)
vi.mock('@/services/endpoints', async importOriginal => {
  // don't spread the original module to avoid TS errors in the test context
  // return only the mocked exports required by the app during this test run
  await importOriginal();
  return {
    profile: {
      getUserProfile: async () => ({
        name: 'Test User',
        role_title: 'React Developer',
        profile_image: '',
        email: 'test@example.com',
        linkedin_url: null,
        github_url: null,
        location: 'Nowhere',
        status: 'Available',
        meta: { years_experience: 5, projects_count: 10 },
      }),
    },
    skills: {
      getSkills: async () => [
        {
          id: 1,
          user_id: 0,
          category: 'Frontend',
          name: 'React',
          icon_class: 'fab fa-react',
          level: 90,
          order_index: 1,
        },
        {
          id: 2,
          user_id: 0,
          category: 'DevOps',
          name: 'Docker',
          icon_class: 'fab fa-docker',
          level: 60,
          order_index: 2,
        },
        {
          id: 3,
          user_id: 0,
          category: 'Backend',
          name: 'Node.js',
          icon_class: 'fab fa-node',
          level: 75,
          order_index: 3,
        },
        {
          id: 4,
          user_id: 0,
          category: 'API',
          name: 'REST API',
          icon_class: 'fas fa-code',
          level: 72,
          order_index: 4,
        },
      ],
    },
    // add minimal noop implementations for other commonly imported endpoints
    experiences: { getExperiences: async () => [] },
    projects: { getProjects: async () => [] },
    certifications: { getCertifications: async () => [] },
    education: { getEducation: async () => [] },
    projects: { getProjects: async () => [] },
    users: { getUsers: async () => [] },
  };
});

// Mock hooks and utils used by ProfileHero
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
vi.mock('@/utils/imageAssets', () => ({ getImageUrl: (k: string) => `/img/${k}.png` }));
// Stub InteractiveTerminal to avoid pulling theme/context providers in tests
vi.mock('@/components/layout/Sections/ProfileHero/Widgets/Terminal/InteractiveTerminal', () => {
  return {
    default: () => React.createElement('div', { 'data-testid': 'stub-terminal' }, null),
  };
});

import ProfileHero from './ProfileHero';

describe('ProfileHero', () => {
  it('renders profile name and tagline', async () => {
    render(<ProfileHero darkMode={false} />);
    expect(await screen.findByText(/Test User/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Test User/ })).toBeTruthy();
  });

  it('shows only skills with level > 70', async () => {
    render(<ProfileHero darkMode={false} />);
    // React (90), REST API (72) and Node.js (75) should appear; Docker (60) should not
    const reactEls = await screen.findAllByTitle('React');
    expect(reactEls.length).toBeGreaterThan(0);
    const restApiEls = await screen.findAllByTitle('REST API');
    expect(restApiEls.length).toBeGreaterThan(0);
    const nodeEls = await screen.findAllByTitle('Node.js');
    expect(nodeEls.length).toBeGreaterThan(0);
    const docker = screen.queryByTitle('Docker');
    expect(docker).toBeNull();
  });

  it('hovering a skill reveals the hover label with level', async () => {
    const user = userEvent.setup();
    render(<ProfileHero darkMode={false} />);
    const reactEls2 = await screen.findAllByTitle('React');
    const reactEl = reactEls2[0];
    await user.hover(reactEl);
    const { within } = await import('@testing-library/react');
    const label = within(reactEl).getByText(/React — 90%/);
    expect(label).toBeVisible();
  });
});
