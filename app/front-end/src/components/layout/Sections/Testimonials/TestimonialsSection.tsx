import React from 'react';
import { useFab } from '@/contexts/FabContext';
import { useModal } from '@/contexts/ModalContext';
import TestimonialModal from '@/components/layout/Sections/Testimonials/modal/TestimonialModal';
import TestimonialForm from './TestimonialForm';
import HeaderSection from '../../HeaderSection/HeaderSection';
import TestimonialsAdmin from './admin/TestimonialsAdmin';
import { generateAvatarUrl, handleAvatarError } from '@/utils/avatarUtils';
import { useNotificationContext } from '@/hooks/useNotification';
import { useTestimonials } from '@/hooks/useTestimonials';
import styles from './TestimonialsSection.module.css';
import BlurImage from '@/components/utils/BlurImage';

export interface TestimonialItem {
  id: number;
  name: string;
  position: string;
  text: string;
  rating?: number;
  created_at?: string;
}

interface TestimonialsSectionProps {
  testimonials?: Array<
    Partial<
      TestimonialItem & {
        avatar?: string;
        email?: string;
        avatar_url?: string;
        company?: string;
        website?: string;
      }
    >
  >;
  onAdd?: (t: any) => void;
  onEdit?: (id: number, t: Partial<TestimonialItem>) => void;
  onDelete?: (id: number) => void;
  onTestimonialsChange?: () => void;
  isAdminMode?: boolean;
  showAdminFAB?: boolean;
  onAdminClick?: () => void;
}

const emptyForm = {
  name: '',
  position: '',
  text: '',
  email: '',
  company: '',
  website: '',
  rating: 5,
};

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials: testimonialsProp,
  onAdd,
  onEdit,
  onDelete,
  onTestimonialsChange,
  isAdminMode = false,
}) => {
  const { testimonials: testimonialsData = [], add, refresh, loading } = useTestimonials();
  const { showSuccess, showError } = useNotificationContext();

  const [form, setForm] = React.useState<typeof emptyForm>(emptyForm);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [animatingId, setAnimatingId] = React.useState<number | null>(null);
  const [showOptionalFields, setShowOptionalFields] = React.useState<boolean>(false);
  // NOTE: isSectionActive removed (no longer needed, FAB ahora es global)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [expandedTestimonials, setExpandedTestimonials] = React.useState<Set<number>>(new Set());

  // Fab context (moved out of effects to obey Rules of Hooks)
  const { onOpenTestimonialModal, onOpenTestimonialsAdmin } = useFab();
  const { openModal, closeModal } = useModal();

  const needsReadMore = (text: string) => text.length > 300;
  const getTruncatedText = (text: string, isExpanded: boolean) => {
    if (!needsReadMore(text) || isExpanded) return text;
    return text.substring(0, 300) + '...';
  };

  // Validación de formulario
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) errors.name = 'El nombre es requerido';
    if (form.name.length > 100) errors.name = 'El nombre es demasiado largo';

    if (!form.position.trim()) errors.position = 'El puesto es requerido';
    if (form.position.length > 100) errors.position = 'El puesto es demasiado largo';

    if (!form.text.trim()) errors.text = 'El testimonio es requerido';
    if (form.text.length < 20)
      errors.text = 'El testimonio es demasiado corto (mínimo 20 caracteres)';
    if (form.text.length > 1000)
      errors.text = 'El testimonio es demasiado largo (máximo 1000 caracteres)';

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Email inválido';
    }

    if (form.website && !/^https?:\/\/.+/.test(form.website) && !form.website.includes('.')) {
      errors.website = 'URL inválida';
    }

    if (form.rating < 1 || form.rating > 5) errors.rating = 'La valoración debe estar entre 1 y 5';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const toggleExpanded = (id: number) => {
    setExpandedTestimonials(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  React.useEffect(() => {
    const checkVisibility = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const isVisible =
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) / 2 &&
        rect.bottom >= 100;
      if (isVisible) {
        document.body.classList.add('testimonials-section-active');
      } else {
        document.body.classList.remove('testimonials-section-active');
      }
    };
    checkVisibility();
    window.addEventListener('scroll', checkVisibility);
    return () => window.removeEventListener('scroll', checkVisibility);
  }, []);

  // Suscribirse a eventos globales para abrir modal/admin
  React.useEffect(() => {
    const unregisters: Array<() => void> = [];
    if (onOpenTestimonialModal)
      unregisters.push(onOpenTestimonialModal(() => handleOpenAddModal()));
    if (onOpenTestimonialsAdmin)
      unregisters.push(onOpenTestimonialsAdmin(() => handleOpenAdminModal()));
    return () => unregisters.forEach(u => u());
  }, [onOpenTestimonialModal, onOpenTestimonialsAdmin]);

  // Abrir modal de añadir/editar testimonio usando el ModalContext
  const renderTestimonialModalContent = (isEditing = false) => (
    <TestimonialModal
      isOpen={true}
      onClose={() => closeModal(isEditing ? 'testimonial-edit' : 'testimonial-add')}
      title={isEditing ? 'Editar Testimonio' : 'Añadir Nuevo Testimonio'}
      disableAutoFocus={true}
    >
      <TestimonialForm
        form={form}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        showOptionalFields={showOptionalFields}
        setShowOptionalFields={setShowOptionalFields}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editingId={editingId}
        onCancel={() => closeModal(isEditing ? 'testimonial-edit' : 'testimonial-add')}
        setForm={setForm}
      />
    </TestimonialModal>
  );

  // Función que replica la lógica del FAB para el botón local
  const handleOpenAddModalWithSubmit = async () => {
    try {
      // Importar dinámicamente el formulario de testimonio y abrir el modal
      const mod = await import(
        '@/components/layout/Sections/Testimonials/forms/TestimonialsFormModal'
      );
      const TestimonialsFormModal = mod.default;
      const modalContent = React.createElement(TestimonialsFormModal, {
        isOpen: true,
        onClose: () => closeModal('testimonial-add-local'),
        editingData: null,
        isLoading: false,
        onSubmit: async (data: any) => {
          try {
            // Implementar lógica de envío de testimonio
            const { testimonials } = await import('@/services/endpoints');
            await testimonials.createTestimonial(data);

            // Mostrar mensaje de éxito
            showSuccess(
              'Testimonio enviado',
              'Gracias por compartir tu experiencia. Tu testimonio será revisado.'
            );

            // Cerrar modal
            closeModal('testimonial-add-local');

            // Refrescar la lista de testimonios
            refresh();
          } catch (error) {
            console.error('Error enviando testimonio:', error);
            showError('Error', 'No se pudo enviar el testimonio. Inténtalo de nuevo.');
          }
        },
      });
      openModal('testimonial-add-local', modalContent, {
        title: 'Añadir Testimonio',
        disableAutoFocus: true,
      });
    } catch (err) {
      console.error('No se pudo abrir modal de testimonial:', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    openModal('testimonial-add', renderTestimonialModalContent(false));
  };

  const handleOpenEditModal = () => {
    openModal('testimonial-edit', renderTestimonialModalContent(true));
  };

  const handleOpenAdminModal = () => {
    openModal(
      'testimonial-admin',
      <TestimonialsAdmin
        onClose={() => closeModal('testimonial-admin')}
        onTestimonialsChange={onTestimonialsChange ?? refresh}
      />
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Limpiar error específico cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const normalizedTestimonials = React.useMemo(() => {
    const base = testimonialsProp ?? testimonialsData ?? [];
    return base.map((t: any, idx: number) => ({
      id: typeof t.id === 'number' ? t.id : idx,
      name: t.name || '',
      position: t.position || '',
      avatar: (t as any).avatar || (t as any).avatar_url || undefined,
      text: t.text || '',
      company: (t as any).company,
      website: (t as any).website,
      rating: t.rating,
      created_at: t.created_at,
      email: t.email,
      avatar_url: (t as any).avatar_url,
    }));
  }, [testimonialsProp, testimonialsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Formulario inválido', 'Por favor, corrige los errores antes de continuar');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        onEdit?.(editingId, form);
        setAnimatingId(editingId);
        showSuccess('Testimonio actualizado', 'Los cambios se han guardado correctamente');
      } else {
        const payload = { ...form, user_id: 1, order_index: normalizedTestimonials.length };
        await (onAdd ?? (async p => add(p as any)))(payload);
        setAnimatingId(-1);
        showSuccess('Testimonio enviado', '¡Gracias por compartir tu experiencia!');
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowOptionalFields(false);
      closeModal(editingId ? 'testimonial-edit' : 'testimonial-add');
      setFormErrors({});
      setTimeout(() => setAnimatingId(null), 800);
    } catch (error) {
      console.error('Error al procesar testimonio:', error);
      showError('Error', 'No se pudo procesar el testimonio. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (t: any) => {
    setForm({
      name: t.name,
      position: t.position,
      text: t.text,
      email: '',
      company: t.company || '',
      website: t.website || '',
      rating: t.rating || 5,
    });
    setEditingId(t.id);
    handleOpenEditModal();
    setFormErrors({});
    if (t.company || t.website) setShowOptionalFields(true);
  };

  // Form moved to TestimonialForm

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => handleAvatarError(e);

  const renderStars = (rating?: number) => {
    const finalRating = rating !== undefined && rating !== null ? rating : 5;
    const stars = [] as React.ReactNode[];
    for (let i = 1; i <= 5; i++)
      stars.push(
        <span
          key={i}
          className={`${styles.star} ${i <= finalRating ? styles.starFilled : styles.starEmpty}`}
          aria-hidden
        >
          {'★'}
        </span>
      );
    return <div className={styles.ratingStars}>{stars}</div>;
  };

  // InteractiveStars moved to TestimonialForm

  return (
    <div ref={sectionRef} id="testimonials" className="section-cv" aria-label="Testimonios">
      <HeaderSection
        icon="fas fa-comments"
        title="Testimonios"
        subtitle="Lo que dicen quienes han trabajado conmigo"
        className={styles.testimonials}
      />

      {/* Modal is handled via ModalContext; modal content is rendered through openModal */}

      {isAdminMode && (
        <form
          className={`${styles['testimonial-form']} ${styles['admin-form']}`}
          onSubmit={handleSubmit}
        >
          <div className={styles['form-row']}>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Puesto"
              required
            />
          </div>
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            placeholder="Testimonio"
            required
          />
          <div className={styles['form-row']}>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email (opcional)"
            />
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Empresa (opcional)"
            />
          </div>
          <div className={styles['form-row']}>
            <input
              name="website"
              type="url"
              value={form.website}
              onChange={handleChange}
              placeholder="Sitio web (opcional)"
            />
            <div className={styles['rating-admin-group']}>
              <label htmlFor="admin-rating">Rating:</label>
              <div className={styles['rating-admin-container']}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles['star-button-admin']} ${star <= form.rating ? styles['star-active'] : styles['star-inactive']}`}
                    onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                    aria-label={`Valorar con ${star} estrella${star !== 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
                <span className={styles['rating-text-admin']}>{form.rating}/5</span>
              </div>
            </div>
          </div>
          <div className={styles['form-actions']}>
            <button type="submit" className={`${styles['action-button']} ${styles.primary}`}>
              {editingId ? 'Guardar' : 'Añadir Testimonio'}
            </button>
            {editingId && (
              <button
                type="button"
                className={styles['action-button']}
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <div className="section-container">
        {loading && normalizedTestimonials.length === 0 ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Cargando testimonios...</p>
          </div>
        ) : (
          <div className={styles.testimonialsGrid}>
            {normalizedTestimonials.map((t, idx) => {
              const isExpanded = expandedTestimonials.has(t.id);
              const displayText = getTruncatedText(t.text, isExpanded);
              return (
                <div
                  key={t.id}
                  className={`${styles.testimonialCard}${
                    animatingId === t.id ||
                    (animatingId === -1 && idx === normalizedTestimonials.length - 1)
                      ? ` ${styles.testimonialAnimate}`
                      : ''
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  tabIndex={0}
                  aria-label={`Testimonio de ${t.name}`}
                >
                  <div className={styles.testimonialHeader}>
                    <div className={styles.testimonialAvatarWrapper}>
                      <BlurImage
                        src={generateAvatarUrl({
                          name: t.name,
                          email: t.email,
                          avatar: t.avatar || t.avatar_url,
                        })}
                        alt={`Avatar de ${t.name}`}
                        className={styles.testimonialAvatar}
                        onError={handleImgError}
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className={styles.testimonialBody}>
                    <div
                      className={styles.testimonialTextContainer}
                      aria-expanded={isExpanded}
                      aria-controls={`testimonial-text-${t.id}`}
                    >
                      <p
                        className={`${styles.testimonialText}${isExpanded ? ` ${styles.expanded}` : ''}`}
                        id={`testimonial-text-${t.id}`}
                      >
                        {displayText}
                      </p>
                      {needsReadMore(t.text) && (
                        <button
                          className={styles.readMoreBtn}
                          onClick={() => toggleExpanded(t.id)}
                          aria-expanded={isExpanded}
                          aria-controls={`testimonial-text-${t.id}`}
                          aria-label={
                            isExpanded ? 'Contraer testimonio' : 'Expandir testimonio completo'
                          }
                        >
                          {isExpanded ? 'Leer menos' : 'Leer más'}
                        </button>
                      )}
                    </div>

                    {renderStars(t.rating)}

                    {t.created_at && (
                      <div className={styles.testimonialDate}>
                        <i className="fas fa-calendar-alt" aria-hidden></i>
                        <span>
                          {new Date(t.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.testimonialFooter}>
                    <div className={styles.testimonialAuthor}>
                      <div className={styles.authorInfo}>
                        <span className={styles.authorName}>{t.name}</span>
                        <span className={styles.authorPosition}>
                          {t.position}
                          {t.company && ` en ${t.company}`}
                        </span>
                        {t.website && (
                          <a
                            href={t.website.startsWith('http') ? t.website : `https://${t.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.authorWebsite}
                            aria-label={`Sitio web de ${t.name}`}
                            title="Visitar sitio web"
                          >
                            <i className="fas fa-external-link-alt" />
                          </a>
                        )}
                      </div>
                    </div>

                    {isAdminMode && (
                      <div className={styles.testimonialActions}>
                        <button
                          className={styles.editBtn}
                          title="Editar"
                          aria-label={`Editar testimonio de ${t.name}`}
                          onClick={() => handleEdit(t)}
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          title="Eliminar"
                          aria-label={`Eliminar testimonio de ${t.name}`}
                          onClick={() => onDelete?.(t.id)}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Placeholder para mantener el grid simétrico */}
            {normalizedTestimonials.length % 3 !== 0 &&
              Array.from({ length: 3 - (normalizedTestimonials.length % 3) }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className={styles.testimonialPlaceholder}
                  aria-hidden
                />
              ))}
          </div>
        )}
      </div>

      {normalizedTestimonials.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="fas fa-comments" />
          </div>
          <h3 className={styles.emptyTitle}>No hay testimonios disponibles</h3>
          <p className={styles.emptyDescription}>
            {isAdminMode
              ? 'Añade el primer testimonio usando el formulario de arriba.'
              : '¡Sé el primero en compartir tu experiencia!'}
          </p>
          {!isAdminMode && (
            <button className={styles.emptyCtaBtn} onClick={() => handleOpenAddModalWithSubmit()}>
              <i className="fas fa-plus-circle" />
              Añadir mi testimonio
            </button>
          )}
        </div>
      )}

      {/* Admin modal handled via ModalContext (open with handleOpenAdminModal) */}
    </div>
  );
};

export default TestimonialsSection;
