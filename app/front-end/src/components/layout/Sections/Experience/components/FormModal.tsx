import React from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';
import AddExperienceForm from '../admin/AddExperienceForm';
import AddEducationForm from '../admin/AddEducationForm';
import { useTranslation } from '@/contexts/TranslationContext';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: 'experience' | 'education';
  initialData?: any;
  isEditing: boolean;
  onSubmit: (data: any) => Promise<void>;
}

const FormModal: React.FC<FormModalProps> = ({
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

  // Estados para el progreso del formulario
  const [formData, setFormData] = React.useState<any>(null);
  const [validationErrors, setValidationErrors] = React.useState<any>({});
  const [selectedTechnologies, setSelectedTechnologies] = React.useState<string[]>([]);

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
      showProgress={true}
      formData={formData}
      validationErrors={validationErrors}
      selectedTechnologies={selectedTechnologies}
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
      {formType === 'experience' ? (
        <AddExperienceForm
          formType={formType}
          initialData={initialData}
          isEditing={isEditing}
          onSubmit={onSubmit}
          useModalShell={true}
          useExternalFooter={true}
          formRef={formRef}
          onSave={() => onClose()}
          onCancel={onClose}
          onFormDataChange={setFormData}
          onValidationErrorsChange={setValidationErrors}
          onSelectedTechnologiesChange={setSelectedTechnologies}
        />
      ) : (
        <AddEducationForm
          editingEducation={initialData}
          initialData={initialData}
          isEditing={isEditing}
          onSubmit={onSubmit}
          useModalShell={true}
          useExternalFooter={true}
          formRef={formRef}
          onSave={() => onClose()}
          onCancel={onClose}
          onFormDataChange={setFormData}
          onValidationErrorsChange={setValidationErrors}
        />
      )}
    </ModalShell>
  );
};

export default FormModal;
