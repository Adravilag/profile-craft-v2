import { useState, useEffect, useMemo, lazy, Suspense, type FC } from 'react';
// ModalShell removed from top-level imports (not used directly in this file)
import { useLocation } from 'react-router-dom';
import ProfileHero from '@/components/layout/Sections/ProfileHero/ProfileHero';
import { SmartNavigation, Footer, NavigationOverlay, FloatingActionButtonGroup } from '@/ui';
// NOTE: avoid importing a duplicate FABAction type from the UI helper module
// to prevent type mismatches with the actual FloatingActionButtonGroup
// implementation (it declares its own local FABAction shape). We'll rely on
// type inference on action arrays instead.
import { FabProvider, useFab } from '@/contexts/FabContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation'; // Usar el hook real
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ModalProvider } from '@/contexts/ModalContext';
import { useNotificationContext } from '@/hooks/useNotification';
import { debugLog } from '@/utils/debugConfig';
import useScrollSectionDetection from '@/hooks/useScrollSectionDetection';
import { useRootLayout } from './hooks/useRootLayout';
import { SkillsFilterProvider, CategoryFilters } from '@/features/skills';
import { SectionsLoadingProvider } from '@/contexts/SectionsLoadingContext';

// Hook local para navegación automática cuando se proporciona `initialSection`.
// Se colocó aquí para evitar dependencias adicionales y mantener la lógica cercana al componente.
function useAutoNavigation(
  initialSection: string | undefined,
  currentSection: string | undefined,
  navigateToSection: (s: string) => void
) {
  useEffect(() => {
    if (!initialSection) return;
    // Navegar solo si la sección actual difiere y la función de navegación está disponible
    try {
      if (currentSection !== initialSection && typeof navigateToSection === 'function') {
        navigateToSection(initialSection);
      }
    } catch (err) {
      debugLog.error('useAutoNavigation error:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSection]);
}

// Carga perezosa (Lazy loading) de los componentes de sección
// Esto evita que se carguen todos los componentes al inicio, mejorando el TTI (Time to Interactive)
const AboutSection = lazy(() => import('../Sections/About/AboutSection'));
const ExperienceSection = lazy(() => import('../Sections/Experience/ExperienceSection'));
// Projects are implemented using the (migrated) ProjectsSection component.
const ProjectsSection = lazy(() => import('../Sections/Projects/ProjectsSection'));
const SkillsSection = lazy(() => import('../Sections/Skills/SkillsSection'));
const CertificationsSection = lazy(
  () => import('../Sections/Certifications/CertificationsSection')
);
const TestimonialsSection = lazy(() => import('../Sections/Testimonials/TestimonialsSection'));
const ContactSection = lazy(() => import('../Sections/Contact/ContactSection'));
const ProjectPage = lazy(() => import('../Sections/Projects/pages/ProjectPage/ProjectPage'));
// Componentes de proyectos cargados bajo demanda (si se usan en el futuro pueden re-habilitarse)

interface RootLayoutProps {
  initialSection?: string;
  // Ya no se necesitan los props de componentes si usamos lazy loading
}

// Mover la mayor parte de la lógica a un componente hijo que se renderiza
// dentro del NavigationProvider para que todos los hooks que usan
// `useNavigation` obtengan el contexto correcto.
const RootLayoutContent: FC<RootLayoutProps> = ({ initialSection }) => {
  const { currentSection, navigateToSection } = useNavigation();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { showSuccess: notifySuccess, showError: notifyError } = useNotificationContext();

  const {
    profile,
    isCheckingUsers,
    navItems,
    handleContactSubmit,
    testimonialsFABActions,
    skillsFABActions,
    projectsFABActions,
    experienceFABActions,
    aboutFABActions,
  } = useRootLayout({
    isAuthenticated,
    currentSection,
    initialSection,
    navigateToSection,
    notifySuccess,
    notifyError,
  });

  // Activar la detección de secciones en scroll para sincronizar la URL
  useScrollSectionDetection({ threshold: 0.35, navHeight: 80, debounceDelay: 120 });

  // (global FAB actions removed — not used in this layout)

  return (
    <SkillsFilterProvider>
      <div className="curriculum-container" style={{ position: 'relative' }}>
        <div id="curriculum-container">
          <ProfileHero darkMode={true} />
          <SmartNavigation navItems={navItems} />
          <main className="sections-container">
            <Suspense>
              <div id="about">
                <AboutSection />
              </div>
              <div id="experience">
                <ExperienceSection
                  showAdminFAB={isAuthenticated && currentSection === 'experience'}
                  onAdminClick={() => {}}
                />
              </div>
              <div id="projects">
                <ProjectsSection />
              </div>
              <div id="skills">
                <SkillsSection showAdminFAB={isAuthenticated && currentSection === 'skills'} />
              </div>
              <div id="certifications">
                <CertificationsSection
                  isAdminMode={isAuthenticated}
                  showAdminFAB={isAuthenticated && currentSection === 'certifications'}
                />
              </div>
              <div id="testimonials">
                <TestimonialsSection
                  isAdminMode={false}
                  showAdminFAB={isAuthenticated && currentSection === 'testimonials'}
                />
              </div>
              <div id="contact">
                <ContactSection onSubmit={handleContactSubmit} />
              </div>
            </Suspense>
          </main>
          <Footer className="curriculum-footer" profile={profile} />
          {/* Usar el router para vistas de superposición */}
          <NavigationOverlay />
          {/* Floating Action Buttons globales para secciones (p. ej. Testimonios) */}
          {currentSection === 'testimonials' && (
            <FloatingActionButtonGroup
              actions={testimonialsFABActions as any}
              position="bottom-right"
            />
          )}
          {/* CategoryFilters se renderiza siempre, maneja su propia visibilidad */}
          <CategoryFilters />
          {currentSection === 'skills' && (
            <FloatingActionButtonGroup actions={skillsFABActions as any} position="bottom-right" />
          )}
          {currentSection === 'projects' && (
            <FloatingActionButtonGroup
              actions={projectsFABActions as any}
              position="bottom-right"
            />
          )}
          {currentSection === 'experience' && (
            <FloatingActionButtonGroup
              actions={experienceFABActions as any}
              position="bottom-right"
            />
          )}
          {currentSection === 'about' && (
            <FloatingActionButtonGroup actions={aboutFABActions as any} position="bottom-right" />
          )}

          {/* El modal global ahora se abre desde el FAB usando ModalShell vía ModalContext */}
          {/* Vista individual de artículo/proyecto (overlay) */}
          {(location.pathname.startsWith('/project/') ||
            location.pathname.startsWith('/project/') ||
            location.pathname.startsWith('/profile-craft/projects/')) && (
            <Suspense fallback={<div>Cargando proyecto...</div>}>
              <ProjectPage />
            </Suspense>
          )}
        </div>
      </div>
    </SkillsFilterProvider>
  );
};

const RootLayout: FC<RootLayoutProps> = ({ initialSection }) => {
  return (
    <NavigationProvider>
      <FabProvider>
        <ModalProvider>
          <SectionsLoadingProvider>
            <RootLayoutContent initialSection={initialSection} />
          </SectionsLoadingProvider>
        </ModalProvider>
      </FabProvider>
    </NavigationProvider>
  );
};

export default RootLayout;
