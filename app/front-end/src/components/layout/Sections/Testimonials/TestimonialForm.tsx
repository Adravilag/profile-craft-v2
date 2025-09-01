import React from 'react';
import styles from './TestimonialsSection.module.css';

type Props = {
  form: any;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  showOptionalFields: boolean;
  setShowOptionalFields: (v: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void> | void;
  editingId: number | null;
  onCancel: () => void;
  setForm: (f: any) => void;
};

const TestimonialForm: React.FC<Props> = ({
  form,
  formErrors,
  isSubmitting,
  showOptionalFields,
  setShowOptionalFields,
  handleChange,
  handleSubmit,
  editingId,
  onCancel,
}) => {
  const renderInteractiveStars = ({
    value,
    onChange,
    disabled = false,
  }: {
    value: number;
    onChange: (n: number) => void;
    disabled?: boolean;
  }) => {
    const [hoverRating, setHoverRating] = React.useState(0);
    return (
      <div className={styles.interactiveStars} role="radiogroup" aria-label="Valoración">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={`${styles.starButton} ${star <= (hoverRating || value) ? styles.starActive : styles.starInactive} ${disabled ? styles.starDisabled : ''}`}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            onFocus={() => !disabled && setHoverRating(star)}
            onBlur={() => !disabled && setHoverRating(0)}
            aria-label={`Valorar con ${star} estrella${star !== 1 ? 's' : ''}`}
            role="radio"
            aria-checked={star === value}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <form className={styles.modalForm} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nombre *</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            required
            disabled={isSubmitting}
            className={formErrors.name ? styles.inputError : ''}
            maxLength={100}
          />
          {formErrors.name && <span className={styles.errorMessage}>{formErrors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="position">Puesto *</label>
          <input
            id="position"
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="Tu puesto de trabajo"
            required
            disabled={isSubmitting}
            className={formErrors.position ? styles.inputError : ''}
            maxLength={100}
          />
          {formErrors.position && (
            <span className={styles.errorMessage}>{formErrors.position}</span>
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="text">Testimonio *</label>
        <textarea
          id="text"
          name="text"
          value={form.text}
          onChange={handleChange}
          placeholder="Comparte tu experiencia trabajando conmigo..."
          required
          rows={4}
          disabled={isSubmitting}
          className={formErrors.text ? styles.inputError : ''}
          maxLength={1000}
        />
        <div className={styles.textareaFooter}>
          <span
            className={`${styles.charCount} ${form.text.length > 800 ? styles.charCountWarning : ''}`}
          >
            {form.text.length}/1000 caracteres
          </span>
        </div>
        {formErrors.text && <span className={styles.errorMessage}>{formErrors.text}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="rating">Valoración *</label>
        <div className={styles.ratingInputContainer}>
          {renderInteractiveStars({
            value: form.rating,
            onChange: rating => {
              /* parent should update form */ const ev = {
                target: { name: 'rating', value: rating },
              } as any;
              handleChange(ev);
            },
            disabled: isSubmitting,
          })}
          <span className={styles.ratingText}>{form.rating}/5 estrellas</span>
        </div>
        <small className={styles.ratingHelp}>Califica tu experiencia trabajando conmigo</small>
        {formErrors.rating && <span className={styles.errorMessage}>{formErrors.rating}</span>}
      </div>
      {!showOptionalFields && (
        <button
          type="button"
          className={styles.optionalToggleBtn}
          onClick={() => setShowOptionalFields(true)}
          disabled={isSubmitting}
        >
          <i className="fas fa-plus-circle" />
          Añadir información adicional (opcional)
        </button>
      )}

      {showOptionalFields && (
        <div className={styles.optionalFields}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@ejemplo.com"
                disabled={isSubmitting}
                className={formErrors.email ? styles.inputError : ''}
              />
              <small>Para mostrar tu avatar de Gravatar</small>
              {formErrors.email && <span className={styles.errorMessage}>{formErrors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="company">Empresa</label>
              <input
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Nombre de la empresa"
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="website">Sitio Web</label>
            <input
              id="website"
              name="website"
              type="url"
              value={form.website}
              onChange={handleChange}
              placeholder="https://tusitio.com"
              disabled={isSubmitting}
              className={formErrors.website ? styles.inputError : ''}
            />
            {formErrors.website && (
              <span className={styles.errorMessage}>{formErrors.website}</span>
            )}
          </div>

          <button
            type="button"
            className={styles.optionalHideBtn}
            onClick={() => setShowOptionalFields(false)}
            disabled={isSubmitting}
          >
            <i className="fas fa-minus-circle" />
            Ocultar campos opcionales
          </button>
        </div>
      )}

      <div className={styles.modalActions}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin" />
              Procesando...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane" />
              {editingId ? 'Guardar Cambios' : 'Enviar Testimonio'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TestimonialForm;
