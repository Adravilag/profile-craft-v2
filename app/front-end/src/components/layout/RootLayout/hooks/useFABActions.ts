import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFab } from '@/contexts/FabContext';

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
        icon: 'fas fa-plus',
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
        icon: 'fas fa-shield-alt',
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
        icon: 'fas fa-plus',
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
            // Navegar a la página de administración
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
  }, [isAuthenticated, navigate]);

  return {
    testimonialsFABActions,
    skillsFABActions,
    projectsFABActions,
  };
};
