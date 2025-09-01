import React from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';
import EnhancedExperienceForm from './forms/EnhancedExperienceForm';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: 'experience' | 'education';
  initialData?: any;
  isEditing: boolean;
  onSubmit: (data: any) => Promise<void>;
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  formType,
  initialData,
  isEditing,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const formRef = React.useRef<HTMLFormElement | null>(null);

  return (
    <ModalShell
      title={
        isEditing
          ? `Editar ${formType === 'experience' ? 'Experiencia' : 'Educación'}`
          : `Nueva ${formType === 'experience' ? 'Experiencia' : 'Educación'}`
      }
      onClose={onClose}
      maxWidth={900}
      formRef={formRef}
      actionButtons={[
        { label: 'Cancelar', variant: 'ghost', onClick: onClose },
        {
          label: isEditing
            ? 'Guardar cambios'
            : `Crear ${formType === 'experience' ? 'Experiencia' : 'Educación'}`,
          variant: 'primary',
          submit: true,
        },
      ]}
    >
      <EnhancedExperienceForm
        isOpen={true}
        onClose={onClose}
        formType={formType}
        initialData={initialData}
        isEditing={isEditing}
        onSubmit={onSubmit}
        useModalShell={true}
        useExternalFooter={true}
        formRef={formRef}
      />
    </ModalShell>
  );
};

export default ExperienceModal;
