import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { TranslationProvider } from '@/contexts/TranslationContext';
import ProjectsCarousel from './ProjectsCarousel';

vi.mock('@/services/endpoints', () => ({
  projects: { getProjects: vi.fn().mockResolvedValue([]) },
}));

describe('ProjectsCarousel', () => {
  // Mock IntersectionObserver
  let originalIO: any;
  beforeAll(() => {
    originalIO = (global as any).IntersectionObserver;
    const IOmock = vi.fn().mockImplementation(() => {
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      } as any;
    });
    (global as any).IntersectionObserver = IOmock;
  });
  afterAll(() => {
    (global as any).IntersectionObserver = originalIO;
  });
  const renderWithProviders = (ui: React.ReactElement) =>
    render(<TranslationProvider>{ui}</TranslationProvider>);

  it('renders ARTICLE button when project_url is present', () => {
    renderWithProviders(
      <ProjectsCarousel
        projects={[
          {
            id: '1',
            title: 'Demo',
            image_url: undefined,
            live_url: undefined,
            github_url: undefined,
            project_url: 'https://example.com/article',
            video_demo_url: undefined,
            published_at: undefined,
            views: 0,
            tags: [],
            description: 'desc',
            media: undefined,
            projectType: 'Proyecto',
            technologies: [],
          } as any,
        ]}
      />
    );

    const articleBadges = screen.getAllByRole('link', { name: /artículo|article/i });
    expect(articleBadges.length).toBeGreaterThan(0);
  });
});
