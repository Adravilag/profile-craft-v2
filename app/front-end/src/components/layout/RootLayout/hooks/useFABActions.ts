import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFab } from '@/contexts/FabContext';
import { useModal } from '@/contexts/ModalContext';

// Local FAB action shape matching the FloatingActionButtonGroup implementation
type LocalFABAction = {
  id: string;
  onClick: () => void | Promise<void>;
  icon: string;
  label: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
};

interface UseFABActionsProps {
  currentSection: string;
  isAuthenticated: boolean;
}

interface UseFABActionsReturn {
  testimonialsFABActions: LocalFABAction[];
  skillsFABActions: LocalFABAction[];
  projectsFABActions: LocalFABAction[];
  experienceFABActions: LocalFABAction[];
  aboutFABActions: LocalFABAction[];
  certificationsFABActions: LocalFABAction[];
}

/**
 * Hook que centraliza las acciones de FAB simples (sin JSX) para diferentes secciones.
 * Para acciones que requieren JSX (como experiencias), se mantienen en el componente principal.
 */
export const useFABActions = ({
  currentSection,
  isAuthenticated,
}: UseFABActionsProps): UseFABActionsReturn => {
  const {
    openTestimonialModal,
    openTestimonialsAdmin,
    openSkillModal,
    onOpenExperienceModal,
    openAboutModal,
  } = useFab();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();

  // Acciones del FAB para la sección de testimonios
  const testimonialsFABActions = useMemo<LocalFABAction[]>(() => {
    const actions: LocalFABAction[] = [
      {
        id: 'add-testimonial',
        onClick: () => {
          try {
            openTestimonialModal();
          } catch (err) {
            console.error('No se pudo abrir modal de testimonial:', err);
          }
        },
        icon: 'fas fa-comment-plus',
        label: 'Añadir Testimonio',
        color: 'success',
      },
    ];

    if (isAuthenticated) {
      actions.unshift({
        id: 'admin-testimonials',
        onClick: () => {
          try {
            openTestimonialsAdmin();
          } catch (err) {
            console.error('No se pudo abrir admin de testimonios:', err);
          }
        },
        icon: 'fas fa-comments',
        label: 'Gestionar Testimonios',
        color: 'primary',
      });
    }

    return actions;
  }, [isAuthenticated, openTestimonialModal, openTestimonialsAdmin]);

  // Acciones del FAB para la sección de skills
  const skillsFABActions = useMemo<LocalFABAction[]>(
    () => [
      {
        id: 'add-skill',
        onClick: () => openSkillModal(),
        icon: 'fas fa-star-of-life',
        label: 'Añadir Habilidad',
        color: 'success',
      },
    ],
    [openSkillModal]
  );

  // Acciones del FAB para la sección de proyectos
  const projectsFABActions = useMemo<LocalFABAction[]>(() => {
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
        icon: 'fas fa-folder-plus',
        label: 'Añadir Proyecto',
        color: 'success',
      },
    ];

    if (isAuthenticated) {
      base.unshift({
        id: 'admin-projects',
        onClick: async () => {
          try {
            // Navegar a la página de administración
            navigate('/projects/admin');
          } catch (err) {
            console.error('No se pudo navegar a admin de proyectos:', err);
          }
        },
        icon: 'fas fa-folder-open',
        label: 'Gestionar Proyectos',
        color: 'primary',
      });
    }

    return base;
  }, [isAuthenticated, navigate]);

  // Acciones del FAB para la sección de experiencias (con soporte JSX completo)
  const experienceFABActions = useMemo<LocalFABAction[]>(() => {
    const base: LocalFABAction[] = [];

    // Solo agregar acciones administrativas si el usuario está autenticado
    if (isAuthenticated) {
      base.push({
        id: 'add-experience',
        onClick: async () => {
          try {
            const mod = await import(
              '@/components/layout/Sections/Experience/components/FormModal'
            );
            const FormModalComp = mod.default;

            const modalContent = React.createElement(FormModalComp, {
              isOpen: true,
              onClose: () => closeModal('experience-add'),
              formType: 'experience',
              initialData: {},
              isEditing: false,
              onSubmit: async (data: any) => {
                try {
                  const { convertSpanishDateToISO } = await import('@/utils/dateUtils');
                  const endpoints = await import('@/services/endpoints');

                  const startIso = convertSpanishDateToISO(data.start_date || data.startDate || '');
                  const endIso = data.end_date ? convertSpanishDateToISO(data.end_date) : '';

                  const technologies = Array.isArray(data.technologies)
                    ? data.technologies
                    : typeof data.technologies === 'string'
                      ? data.technologies
                          .split(',')
                          .map((t: string) => t.trim())
                          .filter(Boolean)
                      : [];

                  const payload = {
                    position: data.title || data.position || '',
                    company: data.company || '',
                    start_date: startIso,
                    end_date: endIso,
                    description: data.description || '',
                    technologies,
                    is_current: !!data.is_current,
                    order_index: data.order_index || 0,
                  };

                  const created = await endpoints.experiences.createExperience(payload as any);
                  try {
                    window.dispatchEvent(
                      new CustomEvent('experience-changed', { detail: created })
                    );
                  } catch (e) {}
                  closeModal('experience-add');
                } catch (err) {
                  console.error('Error creando experiencia desde FAB:', err);
                  throw err;
                }
              },
            });

            openModal('experience-add', modalContent, {
              title: 'Nueva Experiencia',
              disableAutoFocus: true,
            });
          } catch (err) {
            console.error('No se pudo abrir modal de añadir experiencia:', err);
          }
        },
        icon: 'fas fa-briefcase',
        label: 'Añadir Experiencia',
        color: 'success',
      });

      // Acción para añadir una *compañía* — reutilizamos el modal de experiencia
      // y dejamos el campo `company` accesible; no existe un endpoint `companies`
      // en este repo, así que la intención es abrir el formulario de experiencia
      // para crear una nueva entrada con la compañía.
      base.push({
        id: 'add-company',
        onClick: async () => {
          try {
            const mod = await import(
              '@/components/layout/Sections/Experience/components/FormModal'
            );
            const FormModalComp = mod.default;

            const modalContent = React.createElement(FormModalComp, {
              isOpen: true,
              onClose: () => closeModal('company-add'),
              formType: 'experience',
              // Preconfiguramos initialData para enfocar el formulario en company
              initialData: { company: '' },
              isEditing: false,
              onSubmit: async (data: any) => {
                try {
                  const { convertSpanishDateToISO } = await import('@/utils/dateUtils');
                  const endpoints = await import('@/services/endpoints');

                  const startIso = convertSpanishDateToISO(data.start_date || data.startDate || '');
                  const endIso = data.end_date ? convertSpanishDateToISO(data.end_date) : '';

                  const technologies = Array.isArray(data.technologies)
                    ? data.technologies
                    : typeof data.technologies === 'string'
                      ? data.technologies
                          .split(',')
                          .map((t: string) => t.trim())
                          .filter(Boolean)
                      : [];

                  const payload = {
                    position: data.title || data.position || '',
                    company: data.company || '',
                    start_date: startIso,
                    end_date: endIso,
                    description: data.description || '',
                    technologies,
                    is_current: !!data.is_current,
                    order_index: data.order_index || 0,
                  };

                  const created = await endpoints.experiences.createExperience(payload as any);
                  try {
                    window.dispatchEvent(new CustomEvent('company-changed', { detail: created }));
                  } catch (e) {}
                  closeModal('company-add');
                } catch (err) {
                  console.error('Error creando empresa desde FAB:', err);
                  throw err;
                }
              },
            });

            openModal('company-add', modalContent, {
              title: 'Nueva Empresa',
              disableAutoFocus: true,
            });
          } catch (err) {
            console.error('No se pudo abrir modal de añadir empresa:', err);
          }
        },
        icon: 'fas fa-building',
        label: 'Añadir Empresa',
        color: 'success',
      });
    }

    return base;
  }, [isAuthenticated, openModal, closeModal]);

  // Acciones del FAB para la sección About
  const aboutFABActions = useMemo<LocalFABAction[]>(() => {
    if (!isAuthenticated) {
      return [];
    }

    return [
      {
        id: 'edit-about',
        onClick: async () => {
          try {
            // Importar dinámicamente el componente AboutModal
            const mod = await import('@/components/layout/Sections/About/modals/AboutModal');
            const AboutModalComp = mod.AboutModal;

            const modalContent = React.createElement(AboutModalComp, {
              isOpen: true,
              onClose: () => closeModal('about-edit'),
            });

            openModal('about-edit', modalContent, {
              title: 'Editar Sección About',
              disableAutoFocus: true,
            });
          } catch (err) {
            console.error('No se pudo abrir modal de edición de About:', err);
          }
        },
        icon: 'fas fa-user-edit',
        label: 'Editar Acerca de',
        color: 'primary',
      },
    ];
  }, [isAuthenticated, openModal, closeModal]);

  // Acciones del FAB para la sección de certificaciones
  const certificationsFABActions = useMemo<LocalFABAction[]>(() => {
    const actions: LocalFABAction[] = [
      {
        id: 'add-certification',
        onClick: () => {
          // Disparar evento para abrir el modal de certificación
          window.dispatchEvent(new CustomEvent('certification-add-requested'));
        },
        icon: 'fas fa-certificate',
        label: 'Añadir Certificación',
        color: 'success',
      },
    ];

    return actions;
  }, []);

  return {
    testimonialsFABActions,
    skillsFABActions,
    projectsFABActions,
    experienceFABActions,
    aboutFABActions,
    certificationsFABActions,
  };
};
