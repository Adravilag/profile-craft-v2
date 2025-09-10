import { useCallback, type FormEvent } from 'react';
import contactService from '@/services/contactService';
import { useNotificationContext } from '@/hooks/useNotification';

interface UseContactFormReturn {
  handleContactSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * Hook que maneja la lógica del formulario de contacto.
 * Extrae la lógica de submit del componente principal.
 */
export const useContactForm = (): UseContactFormReturn => {
  const { showSuccess: notifySuccess, showError: notifyError } = useNotificationContext();

  const handleContactSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        subject: formData.get('subject') as string,
        message: formData.get('message') as string,
      };

      try {
        const response = await contactService.sendMessage(data);
        if ((response as any).success) {
          notifySuccess(
            'Mensaje enviado',
            (response as any).message || '¡Gracias por contactarme!'
          );
          // Reset form
          (e.currentTarget as HTMLFormElement).reset();
        } else {
          throw new Error((response as any).message || 'Error al enviar el mensaje');
        }
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        notifyError(
          'Error',
          error instanceof Error ? error.message : 'Hubo un problema al enviar tu mensaje.'
        );
      }
    },
    [notifySuccess, notifyError]
  );

  return {
    handleContactSubmit,
  };
};
