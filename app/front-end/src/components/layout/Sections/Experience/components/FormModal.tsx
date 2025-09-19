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
  const { t, language } = useTranslation();
  const formRef = React.useRef<HTMLFormElement | null>(null);

  // Local language selector state (mirrors AboutModal behavior)
  const [lang, setLang] = React.useState<'es' | 'en'>(() => (language === 'en' ? 'en' : 'es'));

  // localizedData stores the two-language values for fields that are localizable
  const [localizedData, setLocalizedData] = React.useState<any>(() => {
    const base = {
      title: { es: '', en: '' },
      company: { es: '', en: '' },
      description: { es: '', en: '' },
    } as any;

    // initialize from provided initialData (if any)
    if (initialData) {
      const toLocalized = (v: any) => {
        if (v == null) return { es: '', en: '' };
        if (typeof v === 'string') return { es: v, en: v };
        return { es: v.es ?? v.en ?? '', en: v.en ?? v.es ?? '' };
      };

      base.title = toLocalized(initialData.position ?? initialData.title);
      base.company = toLocalized(initialData.company);
      base.description = toLocalized(initialData.description);
    }

    return base;
  });

  // Visible form data coming from the child Add*Form via onFormDataChange

  // Estados para el progreso del formulario
  const [formData, setFormData] = React.useState<any>(null);
  const [validationErrors, setValidationErrors] = React.useState<any>({});
  const [selectedTechnologies, setSelectedTechnologies] = React.useState<string[]>([]);

  // Persist visible formData into localizedData under targetLang
  const persistVisibleToLocalized = (targetLang: 'es' | 'en') => {
    const prev = localizedData || {};
    const copy = { ...(prev || {}) } as any;

    copy.title = { ...(copy.title || { es: '', en: '' }) };
    copy.company = { ...(copy.company || { es: '', en: '' }) };
    copy.description = { ...(copy.description || { es: '', en: '' }) };

    // formData may be null until child notifies changes; fallback to initialData
    const visible = formData || initialData || {};

    // Map known fields
    copy.title[targetLang] = visible.position ?? visible.title ?? copy.title[targetLang] ?? '';
    copy.company[targetLang] = visible.company ?? copy.company[targetLang] ?? '';
    copy.description[targetLang] = visible.description ?? copy.description[targetLang] ?? '';

    return copy;
  };

  const handleLangChange = (newLang: 'es' | 'en') => {
    if (newLang === lang) return;
    const nextLocalized = persistVisibleToLocalized(lang);
    setLocalizedData(nextLocalized);

    // map localized -> visible for the new language
    const mapForLang = (t: any) => (t ? (typeof t === 'string' ? t : (t[newLang] ?? '')) : '');

    const visible = {
      // position/title
      title: mapForLang(nextLocalized.title),
      position: mapForLang(nextLocalized.title),
      company: mapForLang(nextLocalized.company),
      description: mapForLang(nextLocalized.description),
      // keep other non-localized fields from current formData or initialData
      start_date: formData?.start_date ?? initialData?.start_date ?? '',
      end_date: formData?.end_date ?? initialData?.end_date ?? '',
      technologies: selectedTechnologies ?? initialData?.technologies ?? '',
      order_index: formData?.order_index ?? initialData?.order_index ?? 0,
      is_current: formData?.is_current ?? initialData?.is_current ?? false,
    };

    // Ensure child forms see the visible language change by updating our formData state
    setFormData(visible);
    setLang(newLang);
  };

  // Handler para que los formularios hijos sincronicen campos localizables
  const handleLocalizedFieldChangeInner = React.useCallback(
    (field: string, value: string) => {
      setLocalizedData((prev: any) => {
        const copy = { ...(prev || {}) } as any;
        if (!copy[field]) copy[field] = { es: '', en: '' };
        copy[field] = { ...(copy[field] || { es: '', en: '' }), [lang]: value };
        return copy;
      });
    },
    [lang]
  );

  // Memoized visible editing objects for children
  const editingExperienceVisible = React.useMemo(
    () =>
      ({
        ...initialData,
        position:
          typeof localizedData.title === 'object'
            ? (localizedData.title[lang] ?? initialData?.position ?? initialData?.title)
            : (initialData?.position ?? initialData?.title),
        company:
          typeof localizedData.company === 'object'
            ? (localizedData.company[lang] ?? initialData?.company)
            : initialData?.company,
        description:
          typeof localizedData.description === 'object'
            ? (localizedData.description[lang] ?? initialData?.description)
            : initialData?.description,
      }) as any,
    [initialData, localizedData, lang]
  );

  const editingEducationVisible = React.useMemo(
    () =>
      ({
        ...initialData,
        title:
          typeof localizedData.title === 'object'
            ? (localizedData.title[lang] ?? initialData?.title)
            : initialData?.title,
        institution:
          typeof localizedData.company === 'object'
            ? (localizedData.company[lang] ?? initialData?.company)
            : initialData?.company,
        description:
          typeof localizedData.description === 'object'
            ? (localizedData.description[lang] ?? initialData?.description)
            : initialData?.description,
      }) as any,
    [initialData, localizedData, lang]
  );

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
      headerActions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            aria-pressed={lang === 'es'}
            onClick={() => handleLangChange('es')}
            className={`form-modal__lang-btn ${lang === 'es' ? 'form-modal__lang-btn--active' : ''}`}
            style={{ padding: '6px 8px', borderRadius: 6 }}
          >
            ES
          </button>
          <button
            type="button"
            aria-pressed={lang === 'en'}
            onClick={() => handleLangChange('en')}
            className={`form-modal__lang-btn ${lang === 'en' ? 'form-modal__lang-btn--active' : ''}`}
            style={{ padding: '6px 8px', borderRadius: 6 }}
          >
            EN
          </button>
        </div>
      }
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
          editingExperience={editingExperienceVisible}
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
          localizedData={localizedData}
          onLocalizedFieldChange={handleLocalizedFieldChangeInner}
          visibleLang={lang}
        />
      ) : (
        <AddEducationForm
          editingEducation={editingEducationVisible}
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
          localizedData={localizedData}
          onLocalizedFieldChange={handleLocalizedFieldChangeInner}
          visibleLang={lang}
        />
      )}
    </ModalShell>
  );
};

export default FormModal;
