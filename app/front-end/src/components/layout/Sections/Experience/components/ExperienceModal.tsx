import React from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';
import EnhancedExperienceForm from './forms/EnhancedExperienceForm';
import { useTranslation } from '@/contexts/TranslationContext';

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

  const { t } = useTranslation();
  const formRef = React.useRef<HTMLFormElement | null>(null);

  return (
    <ModalShell
      title={
        isEditing
          ? formType === 'experience'
            ? t.forms.experience.editExperience
            : t.forms.experience.editEducation
          : formType === 'experience'
            ? t.forms.experience.newExperience
            : t.forms.experience.newEducation
      }
      onClose={onClose}
      maxWidth={900}
      formRef={formRef}
      actionButtons={[
        { label: t.states.cancel, variant: 'ghost', onClick: onClose },
        {
          label: isEditing
            ? t.forms.experience.saveChanges
            : formType === 'experience'
              ? t.forms.experience.createExperience
              : t.forms.experience.createEducation,
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
