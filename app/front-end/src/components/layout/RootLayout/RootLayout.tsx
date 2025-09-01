import { useState, useEffect, useMemo, lazy, Suspense, type FC, type FormEvent } from 'react';
// ModalShell removed from top-level imports (not used directly in this file)
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileHero from '@/components/layout/Sections/ProfileHero/ProfileHero';
import { SmartNavigation, Footer, NavigationOverlay, FloatingActionButtonGroup } from '@/ui';
// NOTE: avoid importing a duplicate FABAction type from the UI helper module
// to prevent type mismatches with the actual FloatingActionButtonGroup
// implementation (it declares its own local FABAction shape). We'll rely on
// type inference on action arrays instead.
import { FabProvider, useFab } from '@/contexts/FabContext';
import { useModal } from '@/contexts/ModalContext';
import TestimonialsFormModal from '@/components/layout/Sections/Testimonials/forms/TestimonialsFormModal';
import TestimonialsAdmin from '@/components/layout/Sections/Testimonials/admin/TestimonialsAdmin';
import contactService from '@/services/contactService';
import type { UserProfile } from '@/types/api';
import useScrollSectionDetection from '@/hooks/useScrollSectionDetection';
import { profile as profileApi, auth as authApi } from '@/services/endpoints';
const { getUserProfile } = profileApi;
const { hasRegisteredUser } = authApi;
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation'; // Usar el hook real
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ModalProvider } from '@/contexts/ModalContext';
import { useNotificationContext } from '@/hooks/useNotification';
import { debugLog } from '@/utils/debugConfig';

// Local FAB action shape matching the FloatingActionButtonGroup implementation
type LocalFABAction = {
  id: string;
  onClick: () => void | Promise<void>;
  icon: string;
  label: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
};

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
const ProjectPage = lazy(() => import('../Sections/Projects/pages/ProjectPage'));
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
  const { openTestimonialModal, openTestimonialsAdmin, openSkillModal } = useFab();
  const { openModal, closeModal } = useModal();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess: notifySuccess, showError: notifyError } = useNotificationContext();

  // Solo necesitamos el setter; el valor no se usa directamente en el render
  const [, setHasUsers] = useState<boolean | null>(null);
  const [isCheckingUsers, setIsCheckingUsers] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkAndLoadProfile = async () => {
      try {
        setIsCheckingUsers(true);
        const userExists = await hasRegisteredUser();
        setHasUsers(userExists || false);
        if (userExists) {
          const userProfile = await getUserProfile();
          setProfile(userProfile);
        }
      } catch (error) {
        debugLog.error('❌ Error en la verificación de usuarios o carga de perfil:', error);
        setHasUsers(false);
        setProfile(null);
      } finally {
        setIsCheckingUsers(false);
      }
    };

    checkAndLoadProfile();
  }, []);

  // Mover lógica de navegación a un hook para mayor claridad y reutilización
  useAutoNavigation(initialSection, currentSection, navigateToSection);

  // Activar la detección de secciones en scroll para sincronizar la URL
  useScrollSectionDetection({ threshold: 0.35, navHeight: 80, debounceDelay: 120 });

  useEffect(() => {
    const root = document.documentElement;
    if (isCheckingUsers) {
      root.setAttribute('data-app-loading', 'true');
    } else {
      root.removeAttribute('data-app-loading');
    }
    return () => root.removeAttribute('data-app-loading');
  }, [isCheckingUsers]);

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };
    try {
      const response = await contactService.sendMessage(data);
      if (response.success) {
        notifySuccess('Mensaje enviado', response.message || '¡Gracias por contactarme!');
      } else {
        throw new Error(response.message || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      notifyError(
        'Error',
        error instanceof Error ? error.message : 'Hubo un problema al enviar tu mensaje.'
      );
    }
  };

  const navItems = useMemo(
    () => [
      { id: 'home', label: 'Inicio', icon: 'fas fa-home' },
      { id: 'about', label: 'Sobre mí', icon: 'fas fa-user' },
      { id: 'experience', label: 'Experiencia', icon: 'fas fa-briefcase' },
      { id: 'projects', label: 'Proyectos', icon: 'fas fa-project-diagram' },
      { id: 'skills', label: 'Habilidades', icon: 'fas fa-tools' },
      { id: 'certifications', label: 'Certificaciones', icon: 'fas fa-certificate' },
      { id: 'testimonials', label: 'Testimonios', icon: 'fas fa-comments' },
      { id: 'contact', label: 'Contacto', icon: 'fas fa-envelope' },
    ],
    []
  );

  // Acciones del FAB para la sección de testimonios (memoizadas)
  // useFab can't be used here because it's not inside provider yet; we'll compute actions
  const testimonialsFABActions = useMemo<LocalFABAction[]>(() => {
    const actions: LocalFABAction[] = [
      {
        id: 'add-testimonial',
        onClick: () => {
          // Abrir modal usando ModalContext
          openModal(
            'testimonial-add',
            <TestimonialsFormModal
              isOpen={true}
              onClose={() => closeModal('testimonial-add')}
              onSubmit={async data => {
                try {
                  await (
                    await import('@/services/endpoints')
                  ).testimonials.createTestimonial(data as any);
                  closeModal('testimonial-add');
                } catch (err) {
                  // noop: el hook de testimonios o notificaciones manejará errores si es necesario
                }
              }}
            />,
            { title: 'Añadir Testimonio', disableAutoFocus: true }
          );
        },
        icon: 'fas fa-plus',
        label: 'Añadir Testimonio',
        color: 'success',
      },
    ];
    if (isAuthenticated) {
      actions.unshift({
        id: 'admin-testimonials',
        onClick: () => {
          openModal(
            'testimonial-admin',
            <TestimonialsAdmin
              onClose={() => closeModal('testimonial-admin')}
              onTestimonialsChange={undefined}
            />,
            { title: 'Administración de Testimonios' }
          );
        },
        icon: 'fas fa-shield-alt',
        label: 'Gestionar Testimonios',
        color: 'primary',
      });
    }
    return actions;
  }, [isAuthenticated, openTestimonialModal, openTestimonialsAdmin]);

  // (global FAB actions removed — not used in this layout)

  return (
    <div className="curriculum-container" style={{ position: 'relative' }}>
      <div id="curriculum-container">
        <ProfileHero darkMode={true} />
        <SmartNavigation navItems={navItems} />
        <main className="sections-container">
          <Suspense fallback={<div>Cargando...</div>}>
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
              <ProjectsSection
                showAdminButton={isAuthenticated && currentSection === 'projects'}
                onAdminClick={() => {}}
              />
            </div>
            <div id="skills">
              <SkillsSection showAdminFAB={isAuthenticated && currentSection === 'skills'} />
            </div>
            <div id="certifications">
              <CertificationsSection
                isAdminMode={false}
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
        {currentSection === 'skills' && (
          <FloatingActionButtonGroup
            actions={
              [
                {
                  id: 'add-skill',
                  onClick: () => openSkillModal(),
                  icon: 'fas fa-plus',
                  label: 'Añadir Habilidad',
                  color: 'success',
                },
              ] as any
            }
            position="bottom-right"
          />
        )}
        {currentSection === 'projects' && (
          <FloatingActionButtonGroup
            actions={
              (() => {
                const base: LocalFABAction[] = [
                  {
                    id: 'add-project',
                    onClick: async () => {
                      try {
                        // Navegar a la página de creación de proyecto
                        window.location.href = '/projects/new';
                      } catch (err) {
                        console.error('No se pudo navegar a crear proyecto:', err);
                      }
                    },
                    icon: 'fas fa-plus',
                    label: 'Añadir Proyecto',
                    color: 'success',
                  },
                ];

                if (isAuthenticated) {
                  base.unshift({
                    id: 'admin-projects',
                    onClick: async () => {
                      try {
                        // Navegar a la página de administración en lugar de abrir un modal
                        // Esto reutiliza `ProjectsAdminPage` que ya soporta rutas /projects/admin, /projects/new, /projects/edit/:id
                        navigate('/projects/admin');
                      } catch (err) {
                        console.error('No se pudo navegar a admin de proyectos:', err);
                      }
                    },
                    icon: 'fas fa-shield-alt',
                    label: 'Gestionar Proyectos',
                    color: 'primary',
                  });
                }

                return base;
              })() as any
            }
            position="bottom-right"
          />
        )}
        {currentSection === 'experience' && (
          <FloatingActionButtonGroup
            actions={
              (() => {
                const base: LocalFABAction[] = [
                  {
                    id: 'add-experience',
                    onClick: async () => {
                      try {
                        // Cargar el componente del modal de forma dinámica para mantener bundle ligero
                        const mod = await import(
                          '@/components/layout/Sections/Experience/components/ExperienceModal'
                        );
                        const ExperienceModalComp = mod.default;
                        openModal(
                          'experience-add',
                          <ExperienceModalComp
                            isOpen={true}
                            onClose={() => closeModal('experience-add')}
                            formType={'experience'}
                            initialData={{}}
                            isEditing={false}
                            onSubmit={async (data: any) => {
                              try {
                                const endpoints = await import('@/services/endpoints');
                                const created = await endpoints.experiences.createExperience(
                                  data as any
                                );
                                // Notificar al resto de la app que hubo un cambio (opcional)
                                try {
                                  window.dispatchEvent(
                                    new CustomEvent('experience-changed', { detail: created })
                                  );
                                } catch (e) {}
                                closeModal('experience-add');
                              } catch (err) {
                                // Dejar que el modal muestre los errores si implementa notificaciones
                                console.error('Error creando experiencia desde FAB:', err);
                                throw err;
                              }
                            }}
                          />,
                          { title: 'Nueva Experiencia', disableAutoFocus: true }
                        );
                      } catch (err) {
                        console.error('No se pudo abrir modal de añadir experiencia:', err);
                      }
                    },
                    icon: 'fas fa-plus',
                    label: 'Añadir Experiencia',
                    color: 'success',
                  },
                ];

                if (isAuthenticated) {
                  // abrir modal de administración de experiencias usando ModalContext
                  base.unshift({
                    id: 'admin-experiences',
                    onClick: async () => {
                      try {
                        const mod = await import(
                          '@/components/layout/Sections/Experience/ExperienceAdmin'
                        );
                        const ExperienceAdminComp = mod.default;
                        openModal(
                          'experience-admin',
                          <ExperienceAdminComp onClose={() => closeModal('experience-admin')} />,
                          { title: 'Administración de Trayectoria' }
                        );
                        // Mantener compatibilidad con listeners existentes
                        try {
                          window.dispatchEvent(new CustomEvent('open-experience-admin'));
                        } catch (e) {}
                      } catch (err) {
                        console.error('No se pudo abrir modal admin de experiencias:', err);
                      }
                    },
                    icon: 'fas fa-shield-alt',
                    label: 'Gestionar Experiencias',
                    color: 'primary',
                  });
                }
                return base;
              })() as any
            }
            position="bottom-right"
          />
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
  );
};

const RootLayout: FC<RootLayoutProps> = ({ initialSection }) => {
  return (
    <NavigationProvider>
      <FabProvider>
        <ModalProvider>
          <RootLayoutContent initialSection={initialSection} />
        </ModalProvider>
      </FabProvider>
    </NavigationProvider>
  );
};

export default RootLayout;
