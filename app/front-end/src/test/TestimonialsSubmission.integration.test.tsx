// TestimonialsSubmission.integration.test.tsx - Test de integración para envío de testimonios

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TestimonialsSection from '@/components/layout/Sections/Testimonials/TestimonialsSection';
import { ModalProvider } from '@/contexts/ModalContext';
import { FabProvider } from '@/contexts/FabContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

// Mock de endpoints
const mockCreateTestimonial = vi.fn();
vi.mock('@/services/endpoints', () => ({
  testimonials: {
    createTestimonial: (...args: any[]) => mockCreateTestimonial(...args),
  },
}));

// Mock de hook de testimonios
const mockRefresh = vi.fn();
const mockAdd = vi.fn();
vi.mock('@/hooks/useTestimonials', () => ({
  default: () => ({
    testimonials: [],
    loading: false,
    error: null,
    refresh: mockRefresh,
    add: mockAdd,
  }),
}));

// Mock de hook de notificaciones
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock('@/hooks/useNotification', () => ({
  useNotificationContext: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
  useNotification: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

// Wrapper con todos los providers necesarios
const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <NotificationProvider>
      <ModalProvider>
        <FabProvider>{children}</FabProvider>
      </ModalProvider>
    </NotificationProvider>
  </BrowserRouter>
);

describe('[TEST INTEGRACIÓN] Envío de Testimonios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTestimonial.mockResolvedValue({
      id: '123',
      name: 'Juan Pérez',
      position: 'Desarrollador Frontend',
      text: 'Excelente trabajo, muy profesional.',
      status: 'pending',
    });
  });

  it('🟢 debe enviar testimonio desde el botón "Añadir mi testimonio"', async () => {
    const user = userEvent.setup();

    render(
      <AllProvidersWrapper>
        <TestimonialsSection />
      </AllProvidersWrapper>
    );

    // Debe mostrar el estado vacío con el botón
    expect(screen.getByText('No hay testimonios disponibles')).toBeInTheDocument();
    const addButton = screen.getByText('Añadir mi testimonio');
    expect(addButton).toBeInTheDocument();

    // Hacer click en el botón
    await user.click(addButton);

    // Esperar a que aparezca el modal
    await waitFor(() => {
      expect(screen.getByText('Nuevo Testimonio')).toBeInTheDocument();
    });

    // Llenar el formulario
    const nameInput = screen.getByLabelText(/nombre completo/i);
    const positionInput = screen.getByLabelText(/puesto.*cargo/i);
    const textArea = screen.getByLabelText(/tu testimonio/i);

    await user.type(nameInput, 'Juan Pérez');
    await user.type(positionInput, 'Desarrollador Frontend');
    await user.type(textArea, 'Excelente trabajo, muy profesional y entregó todo a tiempo.');

    // Hacer submit del formulario
    const submitButton = screen.getByText(/enviar/i);
    await user.click(submitButton);

    // Verificar que se llamó al servicio de creación
    await waitFor(() => {
      expect(mockCreateTestimonial).toHaveBeenCalledWith({
        name: 'Juan Pérez',
        position: 'Desarrollador Frontend',
        text: 'Excelente trabajo, muy profesional y entregó todo a tiempo.',
        email: '',
        company: '',
        website: '',
        avatar: '',
        linkedin: '',
        phone: '',
        rating: 5,
      });
    });

    // Verificar que se mostró el mensaje de éxito
    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Testimonio enviado',
      'Gracias por compartir tu experiencia. Tu testimonio será revisado.'
    );

    // Verificar que se refrescó la lista
    expect(mockRefresh).toHaveBeenCalled();

    // Verificar que el modal se cerró
    await waitFor(() => {
      expect(screen.queryByText('Nuevo Testimonio')).not.toBeInTheDocument();
    });
  });

  it('🟢 debe manejar errores correctamente', async () => {
    const user = userEvent.setup();

    // Mock error en el endpoint
    mockCreateTestimonial.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AllProvidersWrapper>
        <TestimonialsSection />
      </AllProvidersWrapper>
    );

    // Abrir modal
    const addButton = screen.getByText('Añadir mi testimonio');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Nuevo Testimonio')).toBeInTheDocument();
    });

    // Llenar formulario mínimo
    const nameInput = screen.getByLabelText(/nombre completo/i);
    const positionInput = screen.getByLabelText(/puesto.*cargo/i);
    const textArea = screen.getByLabelText(/tu testimonio/i);

    await user.type(nameInput, 'Test User');
    await user.type(positionInput, 'Test Position');
    await user.type(textArea, 'Test testimonial with enough characters to pass validation.');

    // Hacer submit
    const submitButton = screen.getByText(/enviar/i);
    await user.click(submitButton);

    // Verificar que se mostró el mensaje de error
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Error',
        'No se pudo enviar el testimonio. Inténtalo de nuevo.'
      );
    });

    // El modal debe seguir abierto para que el usuario pueda reintentar
    expect(screen.getByText('Nuevo Testimonio')).toBeInTheDocument();
  });
});
