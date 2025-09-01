import { useMemo } from 'react';
import { useModal } from '@/contexts/ModalContext';

interface UseExperienceFABActionsProps {
  isAuthenticated: boolean;
}

interface FABAction {
  id: string;
  onClick: () => void | Promise<void>;
  icon: string;
  label: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
}

export function useExperienceFABActions({ isAuthenticated }: UseExperienceFABActionsProps) {
  const { openModal, closeModal } = useModal();

  const experienceFABActions = useMemo((): FABAction[] => {
    const base: FABAction[] = [
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
                    const created = await endpoints.experiences.createExperience(data as any);
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
            const mod = await import('@/components/layout/Sections/Experience/ExperienceAdmin');
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
  }, [isAuthenticated, openModal, closeModal]);

  return { experienceFABActions };
}
