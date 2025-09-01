import { useEffect, useState, useCallback } from 'react';
import { testimonials as testimonialsApi } from '@/services/endpoints';
import type { Testimonial } from '@/types/api';
import { useNotificationContext } from '@/hooks/useNotification';

type CreatePayload = Omit<
  Testimonial,
  'id' | '_id' | 'status' | 'created_at' | 'approved_at' | 'rejected_at'
>;

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useNotificationContext();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testimonialsApi.getTestimonials();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando testimonios:', e);
      setError('No se pudieron cargar los testimonios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (payload: CreatePayload) => {
      try {
        await testimonialsApi.createTestimonial(payload as any);
        showSuccess('Testimonio enviado', 'Gracias por tu aporte. Quedó pendiente de aprobación.');
        await load();
      } catch (e) {
        console.error('Error creando testimonio:', e);
        showError('No se pudo enviar el testimonio');
        throw e;
      }
    },
    [load, showError, showSuccess]
  );

  return { testimonials, loading, error, refresh: load, add };
};

export default useTestimonials;
