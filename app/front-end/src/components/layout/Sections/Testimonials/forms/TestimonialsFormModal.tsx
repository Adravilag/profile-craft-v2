// src/components/sections/testimonials/TestimonialsFormModal.tsx

import React, { useState, useEffect } from 'react';
import ModalShell from '@/components/ui/Modal/ModalShell';
import { useNotification } from '@hooks/useNotification';
import styles from './TestimonialsFormModal.module.css';

export interface TestimonialFormData {
  name: string;
  position: string;
  text: string;
  email: string;
  company: string;
  website: string;
  avatar?: string;
  linkedin?: string;
  phone?: string;
  rating?: number;
}

interface TestimonialsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestimonialFormData) => void;
  editingData?: TestimonialFormData | null;
  isLoading?: boolean;
}

const emptyForm: TestimonialFormData = {
  name: '',
  position: '',
  text: '',
  email: '',
  company: '',
  website: '',
  avatar: '',
  linkedin: '',
  phone: '',
  rating: 5,
};

const TestimonialsFormModal: React.FC<TestimonialsFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingData,
  isLoading = false,
}) => {
  const [form, setForm] = useState<TestimonialFormData>(emptyForm);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showError } = useNotification();

  // Efecto para cargar datos de edición
  useEffect(() => {
    if (editingData) {
      setForm(editingData);
      // Mostrar campos avanzados si hay datos opcionales
      const hasOptionalData =
        editingData.company || editingData.website || editingData.linkedin || editingData.phone;
      setShowAdvancedFields(!!hasOptionalData);
    } else {
      setForm(emptyForm);
      setShowAdvancedFields(false);
    }
    setErrors({});
  }, [editingData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!form.position.trim()) {
      newErrors.position = 'El puesto es obligatorio';
    }

    if (!form.text.trim()) {
      newErrors.text = 'El testimonio es obligatorio';
    } else if (form.text.length < 20) {
      newErrors.text = 'El testimonio debe tener al menos 20 caracteres';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (form.website && !form.website.match(/^https?:\/\/.+/)) {
      if (!form.website.includes('.')) {
        newErrors.website = 'Introduce una URL válida';
      } else {
        // Agregar https:// automáticamente
        setForm(prev => ({ ...prev, website: `https://${form.website}` }));
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formRef = React.useRef<HTMLFormElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor, corrige los errores en el formulario');
      return;
    }

    onSubmit(form);
  };

  const handleClose = () => {
    setForm(emptyForm);
    setShowAdvancedFields(false);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalShell
      title={editingData ? 'Editar Testimonio' : 'Nuevo Testimonio'}
      onClose={handleClose}
      maxWidth={800}
      formRef={formRef}
      actionButtons={[
        { label: 'Cancelar', variant: 'ghost', onClick: handleClose },
        {
          label: isLoading ? 'Enviando...' : editingData ? 'Actualizar' : 'Enviar',
          variant: 'primary',
          submit: true,
          disabled: isLoading,
        },
      ]}
    >
      {/* Mantener el cuerpo del modal (formulario) dentro del modal genérico */}
      <div className={styles.modalBody} onMouseDown={e => e.stopPropagation()}>
        {/* Campos básicos */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-user"></i>
            Información Básica
          </h3>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Nombre completo *
              </label>
              <div className={styles.inputWithIcon}>
                <i className={`fas fa-user ${styles.inputIcon}`} aria-hidden="true"></i>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="position" className={styles.formLabel}>
                Puesto / Cargo *
              </label>
              <div className={styles.inputWithIcon}>
                <i className={`fas fa-briefcase ${styles.inputIcon}`} aria-hidden="true"></i>
                <input
                  id="position"
                  name="position"
                  type="text"
                  value={form.position}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.position ? styles.inputError : ''}`}
                  placeholder="ej. Desarrollador Frontend, CEO"
                  required
                />
              </div>
              {errors.position && <span className={styles.errorText}>{errors.position}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="text" className={styles.formLabel}>
              Tu testimonio *
            </label>
            <textarea
              id="text"
              name="text"
              value={form.text}
              onChange={handleChange}
              className={`${styles.formTextarea} ${errors.text ? styles.inputError : ''}`}
              placeholder="Comparte tu experiencia trabajando conmigo..."
              rows={4}
              required
            />
            <div className={styles.charCount}>{form.text.length}/500 caracteres</div>
            {errors.text && <span className={styles.errorText}>{errors.text}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="rating" className={styles.formLabel}>
              Calificación
            </label>
            <div className={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.starButton} ${star <= (form.rating || 0) ? styles.starActive : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                >
                  <i className="fas fa-star"></i>
                </button>
              ))}
              <span className={styles.ratingText}>{form.rating}/5 estrellas</span>
            </div>
          </div>
        </div>

        {/* Toggle para campos avanzados */}
        <div className={styles.toggleSection}>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowAdvancedFields(!showAdvancedFields)}
          >
            <i className={`fas ${showAdvancedFields ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            {showAdvancedFields ? 'Ocultar' : 'Mostrar'} campos opcionales
          </button>
        </div>

        {/* Campos avanzados */}
        {showAdvancedFields && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-building"></i>
              Información Adicional (Opcional)
            </h3>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="company" className={styles.formLabel}>
                  Empresa
                </label>
                <div className={styles.inputWithIcon}>
                  <i className={`fas fa-building ${styles.inputIcon}`} aria-hidden="true"></i>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  Email
                </label>
                <div className={styles.inputWithIcon}>
                  <i className={`fas fa-envelope ${styles.inputIcon}`} aria-hidden="true"></i>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                    placeholder="Tu email"
                  />
                </div>
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="website" className={styles.formLabel}>
                  Sitio web
                </label>
                <div className={styles.inputWithIcon}>
                  <i className={`fas fa-globe ${styles.inputIcon}`} aria-hidden="true"></i>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={form.website}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.website ? styles.inputError : ''}`}
                    placeholder="https://tuempresa.com"
                  />
                </div>
                {errors.website && <span className={styles.errorText}>{errors.website}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="linkedin" className={styles.formLabel}>
                  LinkedIn
                </label>
                <div className={styles.inputWithIcon}>
                  <i className={`fab fa-linkedin ${styles.inputIcon}`} aria-hidden="true"></i>
                  <input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    value={form.linkedin}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="https://linkedin.com/in/tuperfil"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <form
          id="testimonial-form"
          ref={formRef}
          onSubmit={handleSubmit}
          className={styles.testimonialForm}
        ></form>
      </div>
    </ModalShell>
  );
};

export default TestimonialsFormModal;
