import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Importamos el componente real de RootLayout
import RootLayout from './RootLayout';

// Mock simple de todos los componentes anidados para aislar la prueba
vi.mock('../../Sections/About/AboutSection', () => ({
  default: () => <div data-testid="about">About</div>,
}));

vi.mock('../../Sections/Experience/ExperienceSection', () => ({
  default: ({ showAdminFAB }: { showAdminFAB: boolean }) => (
    <div data-testid="experience">Experience - admin: {showAdminFAB.toString()}</div>
  ),
}));

vi.mock('../../Sections/Projects/ProjectsSection', () => ({
  default: () => <div data-testid="projects">Projects</div>,
}));

vi.mock('../../Sections/Skills/SkillsSection', () => ({
  default: ({ showAdminFAB }: { showAdminFAB?: boolean }) => (
    <div data-testid="skills">Skills - admin: {String(showAdminFAB)}</div>
  ),
}));

vi.mock('../../Sections/Certifications/CertificationsSection', () => ({
  default: ({ showAdminFAB }: { showAdminFAB: boolean }) => (
    <div data-testid="certifications">Certifications - admin: {showAdminFAB.toString()}</div>
  ),
}));

vi.mock('../../Sections/Testimonials/TestimonialsSection', () => ({
  default: ({ showAdminFAB }: { showAdminFAB: boolean }) => (
    <div data-testid="testimonials">Testimonials - admin: {showAdminFAB.toString()}</div>
  ),
}));

vi.mock('../../Sections/Contact/ContactSection', () => ({
  default: () => <div data-testid="contact">Contact</div>,
}));

vi.mock('@/components/layout/Sections/ProfileHero/ProfileHero', () => ({
  default: () => <div data-testid="profile-hero">Profile Hero</div>,
}));

// Mock UI components
vi.mock('@/ui', () => ({
  SmartNavigation: () => <nav>Navigation</nav>,
  Footer: () => <footer>Footer</footer>,
  NavigationOverlay: () => <div>NavigationOverlay</div>,
  FloatingActionButtonGroup: () => <div>FAB</div>,
}));

// Mock contexts que necesitamos controlar
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true, // Usuario autenticado
  }),
}));

vi.mock('@/contexts/NavigationContext', () => ({
  NavigationProvider: ({ children }: any) => <div>{children}</div>,
  useNavigation: () => ({
    currentSection: 'skills', // Sección actual: skills
    navigateToSection: vi.fn(),
  }),
}));

// Mock otros contexts y hooks
vi.mock('@/contexts/FabContext', () => ({
  FabProvider: ({ children }: any) => <div>{children}</div>,
  useFab: () => ({
    openTestimonialModal: vi.fn(),
    openTestimonialsAdmin: vi.fn(),
    openSkillModal: vi.fn(),
  }),
}));

vi.mock('@/contexts/ModalContext', () => ({
  ModalProvider: ({ children }: any) => <div>{children}</div>,
  useModal: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
  }),
}));

vi.mock('@/hooks/useNotification', () => ({
  useNotificationContext: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('@/hooks/useScrollSectionDetection', () => ({
  default: vi.fn(),
}));

vi.mock('../hooks/useRootLayout', () => ({
  useRootLayout: () => ({
    profile: { name: 'Test' },
    isCheckingUsers: false,
    navItems: [],
    handleContactSubmit: vi.fn(),
    testimonialsFABActions: [],
    skillsFABActions: [],
    projectsFABActions: [],
    experienceFABActions: [],
    aboutFABActions: [],
  }),
}));

vi.mock('@/features/skills', () => ({
  SkillsFilterProvider: ({ children }: any) => <div>{children}</div>,
  CategoryFilters: () => <div>CategoryFilters</div>,
}));

describe('[FIX] SkillsSection showAdminFAB prop integration', () => {
  it('verifies that SkillsSection receives showAdminFAB prop when isAuthenticated=true and currentSection=skills', async () => {
    // CUANDO: Renderizo RootLayout con usuario autenticado en sección skills
    const { container } = render(
      <BrowserRouter>
        <RootLayout />
      </BrowserRouter>
    );

    // ENTONCES: Esperamos encontrar el texto que indica que showAdminFAB=true
    // (puede tardar un poco debido a Suspense)
    await vi.waitFor(() => {
      const skillsElement = screen.getByTestId('skills');
      expect(skillsElement).toHaveTextContent('Skills - admin: true');
    });

    // VERIFICACIÓN ADICIONAL: otros sections should have showAdminFAB=false
    const experienceElement = screen.getByTestId('experience');
    expect(experienceElement).toHaveTextContent('Experience - admin: false');
  });
});
