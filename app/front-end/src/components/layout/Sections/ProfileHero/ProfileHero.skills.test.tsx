import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import ProfileHero from './ProfileHero';
import type { Skill } from '@/types/api';

// Mock de todos los hooks y servicios necesarios
vi.mock('./hooks', () => ({
  useProfileData: () => ({
    userProfile: {
      name: 'Test User',
      role_title: 'Developer',
      location: 'Test City',
      status: 'Available',
    },
    loading: false,
    error: null,
    refetchProfile: vi.fn(),
  }),
  useProfileStats: () => ({
    statsArray: [],
    remoteLoading: false,
  }),
  useWidgetManager: () => ({
    activeWidget: 'terminal',
    setActiveWidget: vi.fn(),
    widgetHints: { terminal: 'Terminal hint' },
  }),
  useAuthState: () => ({
    showPatternAuth: false,
    setShowPatternAuth: vi.fn(),
    setPatternError: vi.fn(),
  }),
  useLanguage: () => ({
    currentLanguage: 'es',
    changeLanguage: vi.fn(),
    t: {
      profileHero: {
        switchToDarkMode: 'Dark mode active',
        toggleLanguage: 'Toggle language',
        profilePhotoAlt: 'Profile photo of {name}',
        available: 'Available',
        openToRemote: 'Open to remote',
        downloadCV: 'Download CV',
        generating: 'Generating...',
        exploreCV: 'Explore CV',
        terminal: 'Terminal',
        videoCurriculum: 'Video CV',
        projects: 'Projects',
        changeWidgets: 'Change widgets',
        accountMenu: 'Account menu',
        logout: 'Logout',
        locationAndAvailability: 'Location and availability',
      },
      states: {
        error: 'Error',
      },
    },
  }),
  useTypingRotator: () => ({
    currentText: 'Test Developer',
    reset: vi.fn(),
    isTyping: false,
    isErasing: false,
  }),
  useSkills: () => ({
    skills: [
      { id: 1, name: 'React', featured: true, level: 95 },
      { id: 2, name: 'TypeScript', featured: true, level: 90 },
      { id: 3, name: 'Node.js', featured: true, level: 85 },
      { id: 4, name: 'HTML', featured: true, level: 100 },
      { id: 5, name: 'CSS', featured: true, level: 88 },
      { id: 6, name: 'JavaScript', featured: true, level: 92 },
      { id: 7, name: 'Vue', featured: true, level: 75 },
      { id: 8, name: 'Angular', featured: true, level: 80 },
      { id: 9, name: 'Python', featured: true, level: 95 },
      { id: 10, name: 'Java', featured: true, level: 70 },
    ] as Skill[],
    getTopFeaturedSkills: vi.fn((limit: number = 8) => {
      const skills = [
        { id: 4, name: 'HTML', featured: true, level: 100 },
        { id: 1, name: 'React', featured: true, level: 95 },
        { id: 9, name: 'Python', featured: true, level: 95 },
        { id: 6, name: 'JavaScript', featured: true, level: 92 },
        { id: 2, name: 'TypeScript', featured: true, level: 90 },
        { id: 5, name: 'CSS', featured: true, level: 88 },
        { id: 3, name: 'Node.js', featured: true, level: 85 },
        { id: 8, name: 'Angular', featured: true, level: 80 },
        { id: 7, name: 'Vue', featured: true, level: 75 },
        { id: 10, name: 'Java', featured: true, level: 70 },
      ] as Skill[];
      return skills.slice(0, limit);
    }),
  }),
}));

vi.mock('@/hooks/usePDFExport', () => ({
  default: () => ({ exportToPDF: vi.fn() }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

vi.mock('@/hooks/useHeader', () => ({
  useHeader: () => ({
    state: { scrollProgress: 0, isLoading: false },
    actions: { handleDownloadPDF: vi.fn() },
    elementRef: { current: null },
  }),
}));

vi.mock('./components/ContactTooltips/ContactTooltips', () => ({
  default: () => <div data-testid="contact-tooltips">Contact Tooltips</div>,
}));

vi.mock('./components/Widgets/Terminal/InteractiveTerminal', () => ({
  default: () => <div data-testid="interactive-terminal">Terminal</div>,
}));

vi.mock('./components/Widgets/VideoCurriculum/VideoCurriculum', () => ({
  default: () => <div data-testid="video-curriculum">Video CV</div>,
}));

vi.mock('./components/Widgets/ProjectsCarousel/ProjectsCarousel', () => ({
  default: () => <div data-testid="projects-carousel">Projects</div>,
}));

vi.mock('@/features/projects/components/ProjectWidget/ProjectWidget', () => ({
  default: () => <div data-testid="project-widget">Project</div>,
}));

vi.mock('@/components/ui/SkillBadge/SkillBadge', () => ({
  default: ({ skill }: { skill: Skill }) => (
    <div data-testid={`skill-badge-${skill.name}`} data-level={skill.level}>
      {skill.name}
    </div>
  ),
}));

vi.mock('@/components/auth/PatternLogin', () => ({
  default: ({ alt }: { alt: string }) => <img data-testid="pattern-login" alt={alt} />,
}));

describe('ProfileHero - Skills Integration', () => {
  const defaultProps = {
    darkMode: false,
    onToggleDarkMode: vi.fn(),
    isFirstTime: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('[TEST] - ProfileHero debe mostrar solo 6 skills destacados máximo', async () => {
    // Act
    render(<ProfileHero {...defaultProps} />);

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Assert - Verificar que solo se muestran 6 skills
    const skillBadges = screen.getAllByTestId(/skill-badge-/);
    expect(skillBadges).toHaveLength(6);

    // Verificar que son los skills con mayor nivel (top 6)
    const expectedSkills = ['HTML', 'React', 'Python', 'JavaScript', 'TypeScript', 'CSS'];
    expectedSkills.forEach(skillName => {
      expect(screen.getByTestId(`skill-badge-${skillName}`)).toBeInTheDocument();
    });

    // Verificar que los skills con menor nivel no aparecen
    expect(screen.queryByTestId('skill-badge-Vue')).not.toBeInTheDocument();
    expect(screen.queryByTestId('skill-badge-Java')).not.toBeInTheDocument();
  });

  test('[TEST] - Skills deben estar ordenados por nivel descendente', async () => {
    // Act
    render(<ProfileHero {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Assert - Verificar el orden de los levels
    const skillBadges = screen.getAllByTestId(/skill-badge-/);
    const levels = skillBadges.map(badge => parseInt(badge.getAttribute('data-level') || '0'));

    // Verificar que están ordenados descendentemente
    const sortedLevels = [...levels].sort((a, b) => b - a);
    expect(levels).toEqual(sortedLevels);
    expect(levels).toEqual([100, 95, 95, 92, 90, 88]); // HTML, React, Python, JavaScript, TypeScript, CSS
  });
});
