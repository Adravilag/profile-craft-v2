import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RootLayout from './RootLayout';

// Mock todos los componentes de sección
vi.mock('../Sections/About/AboutSection', () => ({
  default: () => <div data-testid="about-section">About Section</div>,
}));

vi.mock('../Sections/Experience/ExperienceSection', () => ({
  default: ({ showAdminFAB }: { showAdminFAB: boolean }) => (
    <div data-testid="experience-section">
      Experience Section - showAdminFAB: {showAdminFAB.toString()}
    </div>
  ),
}));

vi.mock('../Sections/Projects/ProjectsSection', () => ({
  default: () => <div data-testid="projects-section">Projects Section</div>,
}));

vi.mock('../Sections/Skills/SkillsSection', () => ({
  default: ({ showAdminFAB }: { showAdminFAB?: boolean }) => (
    <div data-testid="skills-section">
      Skills Section - showAdminFAB: {showAdminFAB?.toString() || 'undefined'}
    </div>
  ),
}));

vi.mock('../Sections/Certifications/CertificationsSection', () => ({
  default: ({ showAdminFAB }: { showAdminFAB: boolean }) => (
    <div data-testid="certifications-section">
      Certifications Section - showAdminFAB: {showAdminFAB.toString()}
    </div>
  ),
}));

vi.mock('../Sections/Testimonials/TestimonialsSection', () => ({
  default: ({ showAdminFAB }: { showAdminFAB: boolean }) => (
    <div data-testid="testimonials-section">
      Testimonials Section - showAdminFAB: {showAdminFAB.toString()}
    </div>
  ),
}));

vi.mock('../Sections/Contact/ContactSection', () => ({
  default: () => <div data-testid="contact-section">Contact Section</div>,
}));

// Mock ProfileHero
vi.mock('@/components/layout/Sections/ProfileHero/ProfileHero', () => ({
  default: () => <div data-testid="profile-hero">Profile Hero</div>,
}));

// Mock otros componentes
vi.mock('@/ui', () => ({
  SmartNavigation: ({ navItems }: any) => <nav data-testid="smart-navigation">Navigation</nav>,
  Footer: () => <footer data-testid="footer">Footer</footer>,
  NavigationOverlay: () => <div data-testid="navigation-overlay">Navigation Overlay</div>,
  FloatingActionButtonGroup: ({ actions }: any) => <div data-testid="fab-group">FAB Group</div>,
}));

// Mock contexts
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

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true, // Simular usuario autenticado para el caso base
  }),
}));

vi.mock('@/contexts/NavigationContext', () => ({
  NavigationProvider: ({ children }: any) => <div>{children}</div>,
  useNavigation: () => ({
    currentSection: 'skills', // Simular que estamos en la sección skills
    navigateToSection: vi.fn(),
  }),
}));

// Mock hooks
vi.mock('@/hooks/useNotification', () => ({
  useNotificationContext: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('@/hooks/useScrollSectionDetection', () => ({
  default: vi.fn(),
}));

vi.mock('./hooks/useRootLayout', () => ({
  useRootLayout: () => ({
    profile: { name: 'Test User' },
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

// Mock features/skills
vi.mock('@/features/skills', () => ({
  SkillsFilterProvider: ({ children }: any) => <div>{children}</div>,
  CategoryFilters: () => <div data-testid="category-filters">Category Filters</div>,
}));

describe('[TEST] RootLayout - SkillsSection showAdminFAB prop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass showAdminFAB=true to SkillsSection when user is authenticated and in skills section', async () => {
    render(
      <BrowserRouter>
        <RootLayout />
      </BrowserRouter>
    );

    // Esperar a que se cargue el componente lazy
    const skillsSection = await waitFor(() => screen.getByTestId('skills-section'));
    expect(skillsSection).toBeInTheDocument();
    expect(skillsSection).toHaveTextContent('Skills Section - showAdminFAB: true');
  });

  it('should verify other sections also receive correct showAdminFAB props', async () => {
    render(
      <BrowserRouter>
        <RootLayout />
      </BrowserRouter>
    );

    // Esperar a que se carguen los componentes lazy
    await waitFor(() => screen.getByTestId('skills-section'));

    // Experience section should get showAdminFAB=false (current section is 'skills')
    const experienceSection = screen.getByTestId('experience-section');
    expect(experienceSection).toHaveTextContent('Experience Section - showAdminFAB: false');

    // Certifications section should get showAdminFAB=false (current section is 'skills')
    const certificationsSection = screen.getByTestId('certifications-section');
    expect(certificationsSection).toHaveTextContent('Certifications Section - showAdminFAB: false');

    // Testimonials section should get showAdminFAB=false (current section is 'skills')
    const testimonialsSection = screen.getByTestId('testimonials-section');
    expect(testimonialsSection).toHaveTextContent('Testimonials Section - showAdminFAB: false');
  });
});
