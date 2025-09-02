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
}

/**
 * Hook que centraliza las acciones de FAB simples (sin JSX) para diferentes secciones.
 * Para acciones que requieren JSX (como experiencias), se mantienen en el componente principal.
 */
export const useFABActions = ({
  currentSection,
  isAuthenticated,
}: UseFABActionsProps): UseFABActionsReturn => {
  const { openTestimonialModal, openTestimonialsAdmin, openSkillModal } = useFab();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();

  // NOTA: no ocultamos todos los FABs globalmente.
  // Algunas acciones administrativas (como crear experiencia/empresa)
  // solo se mostrarán si `isAuthenticated` es true (ver abajo).

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
                  const endpoints = await import('@/services/endpoints');
                  const created = await endpoints.experiences.createExperience(data as any);
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
                  // Reutilizamos el endpoint de experiencias si queremos persistir
                  // la compañía como parte de una experiencia. Si se requiere
                  // un endpoint independiente para compañías, se deberá añadir
                  // en services/endpoints y adaptar aquí.
                  const endpoints = await import('@/services/endpoints');
                  const created = await endpoints.experiences.createExperience(data as any);
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

    // Acción de administración de experiencias eliminada intencionalmente
    // (antes añadía un FAB con label 'Gestionar Experiencias')

    return base;
  }, [isAuthenticated, openModal, closeModal]);

  return {
    testimonialsFABActions,
    skillsFABActions,
    projectsFABActions,
    experienceFABActions,
  };
};
