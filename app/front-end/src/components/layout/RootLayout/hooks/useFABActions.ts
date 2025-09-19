import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFab } from '@/contexts/FabContext';
import { useModal } from '@/contexts/ModalContext';

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

export const useFABActions = ({
  currentSection,
  isAuthenticated,
}: UseFABActionsProps): UseFABActionsReturn => {
  const { openTestimonialModal, openTestimonialsAdmin, openSkillModal } = useFab();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();

  // Helper para abrir un modal dinámico
  // openDynamicModal ahora recibe una función que devuelve la promesa del import.
  // Esto permite que el bundler (Vite) detecte las rutas dinámicas en tiempo de compilación
  // y genere los chunks correspondientes. Pasar una cadena con alias '@' falla en runtime.
  const openDynamicModal = async (
    importer: () => Promise<any>,
    modalId: string,
    title: string,
    props: Record<string, any> = {}
  ) => {
    try {
      const mod = await importer();
      const Comp = mod.default || mod[Object.keys(mod)[0]]; // Soporte default o named export
      const modalContent = React.createElement(Comp, {
        isOpen: true,
        onClose: () => closeModal(modalId),
        ...props,
      });
      openModal(modalId, modalContent, { title, disableAutoFocus: true });
    } catch (err) {
      console.error(`No se pudo abrir modal ${title}:`, err);
    }
  };

  const testimonialsFABActions = useMemo<LocalFABAction[]>(() => {
    if (!isAuthenticated) return [];

    return [
      {
        id: 'admin-testimonials',
        icon: 'fas fa-comments',
        label: 'Gestionar Testimonios',
        color: 'primary',
        onClick: () => openTestimonialsAdmin(),
      },
      {
        id: 'add-testimonial',
        icon: 'fas fa-comment-dots',
        label: 'Añadir Testimonio',
        color: 'success',
        onClick: async () =>
          openDynamicModal(
            () => import('@/components/layout/Sections/Testimonials/forms/TestimonialsFormModal'),
            'testimonial-add',
            'Añadir Testimonio',
            {
              onSubmit: async (data: any) => {
                try {
                  const { testimonials } = await import('@/services/endpoints');
                  await testimonials.createTestimonial(data);
                  const { useNotification } = await import('@hooks/useNotification');
                  const { showSuccess } = useNotification();
                  showSuccess(
                    'Testimonio enviado',
                    'Gracias por compartir tu experiencia. Tu testimonio será revisado.'
                  );
                  closeModal('testimonial-add');
                  window.dispatchEvent(new CustomEvent('testimonial-submitted'));
                } catch (err) {
                  console.error(err);
                  const { useNotification } = await import('@hooks/useNotification');
                  useNotification().showError('Error', 'No se pudo enviar el testimonio.');
                }
              },
            }
          ),
      },
    ];
  }, [isAuthenticated, openModal, closeModal, openTestimonialsAdmin]);

  const skillsFABActions = useMemo<LocalFABAction[]>(() => {
    if (!isAuthenticated) return [];
    return [
      {
        id: 'add-skill',
        icon: 'fas fa-star-of-life',
        label: 'Añadir Habilidad',
        color: 'success',
        onClick: () => openSkillModal(),
      },
    ];
  }, [isAuthenticated, openSkillModal]);

  const projectsFABActions = useMemo<LocalFABAction[]>(() => {
    if (!isAuthenticated) return [];
    return [
      {
        id: 'admin-projects',
        icon: 'fas fa-folder-open',
        label: 'Gestionar Proyectos',
        color: 'primary',
        onClick: () => navigate('/projects/admin'),
      },
      {
        id: 'add-project',
        icon: 'fas fa-folder-plus',
        label: 'Añadir Proyecto',
        color: 'success',
        onClick: () => {
          window.location.href = '/projects/new';
        },
      },
    ];
  }, [isAuthenticated, navigate]);

  const experienceFABActions = useMemo<LocalFABAction[]>(() => {
    if (!isAuthenticated) return [];

    const createExperienceAction = (modalId: string, title: string, initialData: any = {}) => ({
      id: modalId,
      icon: modalId === 'add-company' ? 'fas fa-building' : 'fas fa-briefcase',
      label: modalId === 'add-company' ? 'Añadir Empresa' : 'Añadir Experiencia',
      color: 'success' as const,
        onClick: () =>
        openDynamicModal(
          () => import('@/components/layout/Sections/Experience/components/FormModal'),
          modalId,
          title,
          {
            formType: 'experience',
            initialData,
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
                        .map(t => t.trim())
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
                window.dispatchEvent(
                  new CustomEvent(
                    modalId === 'add-company' ? 'company-changed' : 'experience-changed',
                    {
                      detail: created,
                    }
                  )
                );
                closeModal(modalId);
              } catch (err) {
                console.error(err);
                throw err;
              }
            },
          }
        ),
    });

    return [
      createExperienceAction('add-experience', 'Nueva Experiencia'),
      createExperienceAction('add-company', 'Nueva Empresa', { company: '' }),
    ];
  }, [isAuthenticated, openModal, closeModal]);

  const aboutFABActions = useMemo<LocalFABAction[]>(() => {
    if (!isAuthenticated) return [];
    return [
      {
        id: 'edit-about',
        icon: 'fas fa-user-edit',
        label: 'Editar Acerca de',
        color: 'primary',
        onClick: () =>
          openDynamicModal(
            () => import('@/components/layout/Sections/About/modals/AboutModal'),
            'about-edit',
            'Editar Sección About'
          ),
      },
    ];
  }, [isAuthenticated, openModal, closeModal]);

  const certificationsFABActions = useMemo<LocalFABAction[]>(
    () => [
      {
        id: 'add-certification',
        icon: 'fas fa-certificate',
        label: 'Añadir Certificación',
        color: 'success',
        onClick: () => {
          window.dispatchEvent(new CustomEvent('certification-add-requested'));
        },
      },
    ],
    []
  );

  return {
    testimonialsFABActions,
    skillsFABActions,
    projectsFABActions,
    experienceFABActions,
    aboutFABActions,
    certificationsFABActions,
  };
};
