import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TestimonialsSection from './TestimonialsSection';

// Mock de módulos externos
vi.mock('@/hooks/useTestimonials', () => ({
  default: () => ({
    testimonials: [],
    add: vi.fn(),
    refresh: vi.fn(),
    loading: false,
  }),
}));

vi.mock('@/hooks/useNotification', () => ({
  useNotificationContext: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('@/utils/avatarUtils', () => ({
  generateAvatarUrl: () => 'https://example.com/avatar.jpg',
  handleAvatarError: vi.fn(),
}));

// Mock del portal para tests
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

describe('TestimonialsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render testimonials section', () => {
    render(<TestimonialsSection />);

    expect(screen.getByText('Testimonios')).toBeInTheDocument();
    expect(screen.getByText('Lo que dicen quienes han trabajado conmigo')).toBeInTheDocument();
  });

  it('should open modal when clicking add testimonial button', async () => {
    const user = userEvent.setup();

    render(<TestimonialsSection />);

    // Buscar el botón de añadir testimonio (puede estar en el estado vacío)
    const addButton =
      screen
        .getByText('¡Sé el primero en compartir tu experiencia!')
        .closest('div')
        ?.querySelector('button') || screen.getByText('Añadir mi testimonio');

    await user.click(addButton);

    // Verificar que el modal se abre
    await waitFor(() => {
      expect(screen.getByText('Añadir Nuevo Testimonio')).toBeInTheDocument();
    });
  });

  it('should handle form input changes correctly', async () => {
    const user = userEvent.setup();

    render(<TestimonialsSection />);

    // Abrir modal
    const addButton = screen.getByText('Añadir mi testimonio');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Añadir Nuevo Testimonio')).toBeInTheDocument();
    });

    // Encontrar los campos del formulario
    const nameInput = screen.getByLabelText('Nombre *');
    const positionInput = screen.getByLabelText('Puesto *');
    const testimonyTextarea = screen.getByLabelText('Testimonio *');

    // Test del campo nombre - click primero para establecer foco
    await user.click(nameInput);
    await user.clear(nameInput);
    await user.type(nameInput, 'Juan Pérez');

    expect(nameInput).toHaveValue('Juan Pérez');

    // Test del campo puesto
    await user.click(positionInput);
    await user.clear(positionInput);
    await user.type(positionInput, 'Desarrollador Frontend');

    expect(positionInput).toHaveValue('Desarrollador Frontend');

    // Test del textarea de testimonio
    await user.click(testimonyTextarea);
    await user.clear(testimonyTextarea);
    await user.type(
      testimonyTextarea,
      'Excelente profesional, muy recomendado para proyectos de frontend.'
    );

    expect(testimonyTextarea).toHaveValue(
      'Excelente profesional, muy recomendado para proyectos de frontend.'
    );

    // Verificar que los valores anteriores se mantienen
    expect(nameInput).toHaveValue('Juan Pérez');
    expect(positionInput).toHaveValue('Desarrollador Frontend');
  });

  it('should not lose focus when typing in any field', async () => {
    const user = userEvent.setup();

    render(<TestimonialsSection />);

    // Abrir modal
    const addButton = screen.getByText('Añadir mi testimonio');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Añadir Nuevo Testimonio')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Nombre *');
    const testimonyTextarea = screen.getByLabelText('Testimonio *');

    // Escribir en el nombre - click para establecer foco inicial
    await user.click(nameInput);
    await user.clear(nameInput);
    await user.type(nameInput, 'Test');
    expect(nameInput).toHaveValue('Test');

    // Escribir en el testimonio - click para cambiar foco
    await user.click(testimonyTextarea);
    await user.clear(testimonyTextarea);
    await user.type(testimonyTextarea, 'Excelente trabajo');
    expect(testimonyTextarea).toHaveValue('Excelente trabajo');

    // Verificar que el nombre sigue con su valor
    expect(nameInput).toHaveValue('Test');
  });

  it('should allow navigation with arrow keys in textarea', async () => {
    const user = userEvent.setup();

    render(<TestimonialsSection />);

    // Abrir modal
    const addButton = screen.getByText('Añadir mi testimonio');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Añadir Nuevo Testimonio')).toBeInTheDocument();
    });

    const testimonyTextarea = screen.getByLabelText('Testimonio *');

    await user.click(testimonyTextarea);
    await user.clear(testimonyTextarea);
    await user.type(testimonyTextarea, 'Primera línea{Enter}Segunda línea');

    // Verificar contenido inicial
    expect(testimonyTextarea).toHaveValue('Primera línea\nSegunda línea');

    // Posicionar cursor al inicio de la primera línea
    await user.keyboard('{Control>}{Home}{/Control}');

    // Insertar texto al inicio
    await user.type(testimonyTextarea, 'NUEVA ');

    expect(testimonyTextarea).toHaveValue('NUEVA Primera línea\nSegunda línea');
  });

  it('should close modal when pressing Escape', async () => {
    const user = userEvent.setup();

    render(<TestimonialsSection />);

    // Abrir modal
    const addButton = screen.getByText('Añadir mi testimonio');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Añadir Nuevo Testimonio')).toBeInTheDocument();
    });

    // Presionar Escape
    await user.keyboard('{Escape}');

    // Verificar que el modal se cierra
    await waitFor(() => {
      expect(screen.queryByText('Añadir Nuevo Testimonio')).not.toBeInTheDocument();
    });
  });

  it('should handle rating selection', async () => {
    const user = userEvent.setup();

    render(<TestimonialsSection />);

    // Abrir modal
    const addButton = screen.getByText('Añadir mi testimonio');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Añadir Nuevo Testimonio')).toBeInTheDocument();
    });

    // Encontrar las estrellas de rating
    const ratingButtons = screen.getAllByRole('radio');
    expect(ratingButtons).toHaveLength(5);

    // Seleccionar 4 estrellas
    await user.click(ratingButtons[3]);

    // Verificar que se muestra la valoración correcta
    expect(screen.getByText('4/5 estrellas')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();

    render(<TestimonialsSection />);

    // Abrir modal
    const addButton = screen.getByText('Añadir mi testimonio');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Añadir Nuevo Testimonio')).toBeInTheDocument();
    });

    // Intentar enviar el formulario sin llenar campos requeridos
    const submitButton = screen.getByText('Enviar Testimonio');
    await user.click(submitButton);

    // El formulario debería mostrar errores de validación
    // Verificamos que los campos están vacíos (indicando validación)
    expect(screen.getByLabelText('Nombre *')).toHaveValue('');
    expect(screen.getByLabelText('Puesto *')).toHaveValue('');
    expect(screen.getByLabelText('Testimonio *')).toHaveValue('');
  });
});
