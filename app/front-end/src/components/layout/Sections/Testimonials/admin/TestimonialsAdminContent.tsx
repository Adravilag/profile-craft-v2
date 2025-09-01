// Component with the internal content of the Testimonials Admin (no portal)
import React, { useState, useEffect } from 'react';
import { testimonials as testimonialsApi } from '@/services/endpoints';
import BlurImage from '@/components/utils/BlurImage';
const { getAdminTestimonials, approveTestimonial, rejectTestimonial, deleteTestimonial } =
  testimonialsApi;
import type { Testimonial } from '@/types/api';
import { generateAvatarUrl } from '@/utils/avatarUtils';
import { useNotification } from '@/hooks/useNotification';
import styles from './TestimonialsAdmin.module.css';

interface TestimonialsAdminProps {
  onClose: () => void;
  onTestimonialsChange?: () => void; // Callback para notificar cambios
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const TestimonialsAdminContent: React.FC<TestimonialsAdminProps> = ({
  onClose,
  onTestimonialsChange,
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const { showSuccess, showError } = useNotification();

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getAdminTestimonials(filter === 'all' ? undefined : filter);
      setTestimonials(data);

      if (allTestimonials.length === 0) {
        const allData = await getAdminTestimonials();
        setAllTestimonials(allData);
      }
    } catch (error) {
      showError('Error al cargar testimonios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApprove = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await approveTestimonial(id, testimonials.length);
      showSuccess('Testimonio aprobado');
      const allData = await getAdminTestimonials();
      setAllTestimonials(allData);
      loadTestimonials();
      onTestimonialsChange?.();
    } catch (error) {
      showError('Error al aprobar testimonio');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await rejectTestimonial(id);
      showSuccess('Testimonio rechazado');
      const allData = await getAdminTestimonials();
      setAllTestimonials(allData);
      loadTestimonials();
      onTestimonialsChange?.();
    } catch (error) {
      showError('Error al rechazar testimonio');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingId) return;
    if (confirm('¿Estás seguro de que quieres eliminar este testimonio?')) {
      setProcessingId(id);
      try {
        await deleteTestimonial(id);
        showSuccess('Testimonio eliminado');
        const allData = await getAdminTestimonials();
        setAllTestimonials(allData);
        loadTestimonials();
        onTestimonialsChange?.();
      } catch (error) {
        showError('Error al eliminar testimonio');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const getAvatarUrl = (testimonial: Testimonial): string => {
    return generateAvatarUrl({
      name: testimonial.name,
      email: testimonial.email,
      avatar: testimonial.avatar_url,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const pendingCount = allTestimonials.filter(t => t.status === 'pending').length;

  return (
    <div className={styles.testimonialsAdminModal}>
      <div className={styles.adminHeader}>
        <h2>
          <i className="fas fa-shield-alt"></i>
          Administración de Testimonios
          {pendingCount > 0 && (
            <span className={styles.pendingBadge}>{pendingCount} pendientes</span>
          )}
        </h2>
        <button className={styles.closeBtn} onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className={styles.adminFilters}>
        <button
          className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes ({allTestimonials.filter(t => t.status === 'pending').length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'approved' ? styles.active : ''}`}
          onClick={() => setFilter('approved')}
        >
          Aprobados ({allTestimonials.filter(t => t.status === 'approved').length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'rejected' ? styles.active : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rechazados ({allTestimonials.filter(t => t.status === 'rejected').length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({allTestimonials.length})
        </button>
      </div>

      <div className={styles.adminContent}>
        {loading ? (
          <div className={styles.loading}>
            <i className="fas fa-spinner fa-spin"></i>
            Cargando testimonios...
          </div>
        ) : testimonials.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-inbox"></i>
            <p>
              No hay testimonios{' '}
              {filter !== 'all'
                ? ` ${
                    filter === 'pending'
                      ? 'pendientes'
                      : filter === 'approved'
                        ? 'aprobados'
                        : 'rechazados'
                  }`
                : ''}
            </p>
          </div>
        ) : (
          <div className={styles.adminTestimonialsList}>
            {testimonials.map(testimonial => (
              <div key={testimonial._id || testimonial.id} className={styles.adminTestimonialCard}>
                <div className={styles.testimonialHeader}>
                  <div className={styles.testimonialMeta}>
                    <BlurImage
                      src={getAvatarUrl(testimonial)}
                      alt={`Avatar de ${testimonial.name}`}
                      className={styles.testimonialAvatar}
                      loading="lazy"
                    />
                    <div className={styles.testimonialInfo}>
                      <h3>{testimonial.name}</h3>
                      <p className={styles.position}>
                        {testimonial.position}
                        {testimonial.company && ` en ${testimonial.company}`}
                      </p>
                      {testimonial.email && (
                        <p className={styles.email}>
                          <i className="fas fa-envelope"></i>
                          {testimonial.email}
                        </p>
                      )}
                      {testimonial.website && (
                        <p className={styles.website}>
                          <i className="fas fa-link"></i>
                          <a
                            href={
                              testimonial.website.startsWith('http')
                                ? testimonial.website
                                : `https://${testimonial.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {testimonial.website}
                          </a>
                        </p>
                      )}
                      <div className={styles.testimonialRating}>
                        <span className={styles.ratingLabel}>Valoración:</span>
                        <div className={styles.ratingStars}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <i
                              key={star}
                              className={`fas fa-star ${
                                star <= (testimonial.rating || 5)
                                  ? styles.starFilled
                                  : styles.starEmpty
                              }`}
                            ></i>
                          ))}
                          <span className={styles.ratingNumber}>({testimonial.rating || 5}/5)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.testimonialStatus}>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: getStatusColor(testimonial.status || 'pending'),
                      }}
                    >
                      {getStatusText(testimonial.status || 'pending')}
                    </span>
                    <span className={styles.createdDate}>
                      {testimonial.created_at &&
                        new Date(testimonial.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
                <div className={styles.testimonialContent}>
                  <p>{testimonial.text}</p>
                </div>

                <div className={styles.testimonialActions}>
                  {testimonial.status === 'pending' && (
                    <>
                      <button
                        className={`${styles.actionBtn} ${styles.approveBtn} ${
                          processingId === testimonial._id ? styles.processing : ''
                        }`}
                        onClick={() => handleApprove(testimonial._id!)}
                        title="Aprobar este testimonio"
                        disabled={processingId !== null}
                      >
                        <i
                          className={
                            processingId === testimonial._id
                              ? 'fas fa-spinner fa-spin'
                              : 'fas fa-check'
                          }
                        ></i>
                        Aprobar
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.rejectBtn} ${
                          processingId === testimonial._id ? styles.processing : ''
                        }`}
                        onClick={() => handleReject(testimonial._id!)}
                        title="Rechazar este testimonio"
                        disabled={processingId !== null}
                      >
                        <i
                          className={
                            processingId === testimonial._id
                              ? 'fas fa-spinner fa-spin'
                              : 'fas fa-times'
                          }
                        ></i>
                        Rechazar
                      </button>
                    </>
                  )}
                  {testimonial.status === 'rejected' && (
                    <button
                      className={`${styles.actionBtn} ${styles.approveBtn} ${
                        processingId === testimonial._id ? styles.processing : ''
                      }`}
                      onClick={() => handleApprove(testimonial._id!)}
                      title="Aprobar este testimonio"
                      disabled={processingId !== null}
                    >
                      <i
                        className={
                          processingId === testimonial._id
                            ? 'fas fa-spinner fa-spin'
                            : 'fas fa-check'
                        }
                      ></i>
                      Aprobar
                    </button>
                  )}
                  {testimonial.status === 'approved' && (
                    <button
                      className={`${styles.actionBtn} ${styles.rejectBtn} ${
                        processingId === testimonial._id ? styles.processing : ''
                      }`}
                      onClick={() => handleReject(testimonial._id!)}
                      title="Quitar aprobación"
                      disabled={processingId !== null}
                    >
                      <i
                        className={
                          processingId === testimonial._id ? 'fas fa-spinner fa-spin' : 'fas fa-ban'
                        }
                      ></i>
                      Quitar aprobación
                    </button>
                  )}
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn} ${
                      processingId === testimonial._id ? styles.processing : ''
                    }`}
                    onClick={() => handleDelete(testimonial._id!)}
                    title="Eliminar permanentemente"
                    disabled={processingId !== null}
                  >
                    <i
                      className={
                        processingId === testimonial._id ? 'fas fa-spinner fa-spin' : 'fas fa-trash'
                      }
                    ></i>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsAdminContent;
