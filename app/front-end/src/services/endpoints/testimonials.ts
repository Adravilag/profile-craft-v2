import type { Testimonial } from '@/types/api';
import {
  getTestimonials as getTestimonialsImpl,
  getAdminTestimonials as getAdminTestimonialsImpl,
  approveTestimonial as approveTestimonialImpl,
  rejectTestimonial as rejectTestimonialImpl,
  deleteTestimonial as deleteTestimonialImpl,
  createTestimonial as createTestimonialImpl,
  updateAdminTestimonial as updateAdminTestimonialImpl,
} from '../api';

/**
 * Obtiene testimonios públicos.
 */
export const getTestimonials = () => getTestimonialsImpl();

/**
 * Obtiene testimonios para administración (puede filtrar por estado).
 */
export const getAdminTestimonials = (status?: string) => getAdminTestimonialsImpl(status);

/**
 * Aprueba un testimonio (admin).
 */
export const approveTestimonial = (id: string, order_index: number = 0) =>
  approveTestimonialImpl(id, order_index);

/**
 * Rechaza un testimonio (admin).
 */
export const rejectTestimonial = (id: string) => rejectTestimonialImpl(id);

/**
 * Elimina un testimonio.
 */
export const deleteTestimonial = (id: string) => deleteTestimonialImpl(id);

/**
 * Crea un testimonio nuevo.
 */
export const createTestimonial = (testimonial: Omit<Testimonial, 'id' | 'status' | 'created_at'>) =>
  createTestimonialImpl(testimonial as any);

/**
 * Actualiza un testimonio desde la interfaz de administración.
 */
export const updateAdminTestimonial = (id: string, testimonial: Partial<Testimonial>) =>
  updateAdminTestimonialImpl(id, testimonial);

export type { Testimonial };
