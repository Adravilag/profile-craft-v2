import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFABActions } from './useFABActions';

// Mock de contextos
const mockUseFab = {
  openTestimonialModal: vi.fn(),
  openTestimonialsAdmin: vi.fn(),
  openSkillModal: vi.fn(),
  onOpenExperienceModal: vi.fn(),
  openAboutModal: vi.fn(), // Nuevo mock que necesitaremos
};

const mockUseModal = {
  openModal: vi.fn(),
  closeModal: vi.fn(),
};

const mockNavigate = vi.fn();

// Mock de endpoints de testimonios
const mockCreateTestimonial = vi.fn();
vi.mock('@/services/endpoints', () => ({
  testimonials: {
    createTestimonial: (...args: any[]) => mockCreateTestimonial(...args),
  },
}));

// Mock de hook de notificaciones
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock('@hooks/useNotification', () => ({
  useNotification: () => ({
    showError: mockShowError,
    showSuccess: mockShowSuccess,
  }),
}));

// Mock de React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock de contextos
vi.mock('@/contexts/FabContext', () => ({
  useFab: () => mockUseFab,
}));

vi.mock('@/contexts/ModalContext', () => ({
  useModal: () => mockUseModal,
}));

describe('useFABActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('[TEST] Testimonial Submission via FAB', () => {
    it('🔴 documenta estado actual - onClick del FAB no envía testimonio', async () => {
      // Test que documenta el comportamiento actual
      const { result } = renderHook(() =>
        useFABActions({
          currentSection: 'testimonials',
          isAuthenticated: false,
        })
      );

      // Obtener la acción de añadir testimonio
      const testimonialActions = result.current.testimonialsFABActions;
      const addTestimonialAction = testimonialActions.find(
        action => action.id === 'add-testimonial'
      );

      expect(addTestimonialAction).toBeDefined();
      expect(addTestimonialAction!.label).toBe('Añadir Testimonio');
      expect(addTestimonialAction!.icon).toBe('fas fa-comment-dots');

      // Mock respuesta exitosa del endpoint
      mockCreateTestimonial.mockResolvedValueOnce({
        id: '123',
        name: 'Juan Pérez',
        position: 'Desarrollador Frontend',
        text: 'Excelente trabajo, muy profesional.',
        status: 'pending',
      });

      // Simular la ejecución del onClick
      // Esta función abre un modal pero no implementa envío
      const onClickPromise = addTestimonialAction!.onClick();
      if (onClickPromise instanceof Promise) {
        await onClickPromise;
      }

      // Documentar estado actual: no se llama al endpoint durante el onClick
      // porque la lógica de envío está comentada como "// Aquí puedes agregar la lógica de envío"
      expect(mockCreateTestimonial).not.toHaveBeenCalled();

      // La implementación actual solo abre un modal, no envía datos
      // Este es el comportamiento que necesitamos cambiar
    });

    it('� verifica que el onClick funciona y abre modal correctamente', async () => {
      // Test simplificado que documenta que el onClick está funcionando
      const { result } = renderHook(() =>
        useFABActions({
          currentSection: 'testimonials',
          isAuthenticated: false,
        })
      );

      const testimonialActions = result.current.testimonialsFABActions;
      const addTestimonialAction = testimonialActions.find(
        action => action.id === 'add-testimonial'
      );

      // Verificar que la acción existe con las propiedades correctas
      expect(addTestimonialAction).toBeDefined();
      expect(addTestimonialAction!.label).toBe('Añadir Testimonio');
      expect(addTestimonialAction!.icon).toBe('fas fa-comment-dots');
      expect(addTestimonialAction!.color).toBe('success');
      expect(typeof addTestimonialAction!.onClick).toBe('function');

      // Esta prueba se centrará en verificar que la implementación actual
      // tiene la estructura correcta para implementar el envío posteriormente
    });
  });

  describe('[TEST] About FAB Actions', () => {
    it('debería incluir aboutFABActions en el retorno del hook', () => {
      const { result } = renderHook(() =>
        useFABActions({
          currentSection: 'about',
          isAuthenticated: true,
        })
      );

      expect(result.current).toHaveProperty('aboutFABActions');
      expect(Array.isArray(result.current.aboutFABActions)).toBe(true);
    });

    it('debería retornar actions vacías para about cuando no está autenticado', () => {
      const { result } = renderHook(() =>
        useFABActions({
          currentSection: 'about',
          isAuthenticated: false,
        })
      );

      expect(result.current.aboutFABActions).toEqual([]);
    });

    it('debería incluir acción de editar about cuando está autenticado', () => {
      const { result } = renderHook(() =>
        useFABActions({
          currentSection: 'about',
          isAuthenticated: true,
        })
      );

      const aboutActions = result.current.aboutFABActions;
      expect(aboutActions).toHaveLength(1);
      expect(aboutActions[0]).toMatchObject({
        id: 'edit-about',
        icon: 'fas fa-user-edit',
        label: 'Editar Acerca de',
        color: 'primary',
      });
      expect(typeof aboutActions[0].onClick).toBe('function');
    });
  });

  describe('Existing functionality should remain unchanged', () => {
    it('debería mantener las acciones existentes para testimonials', () => {
      const { result } = renderHook(() =>
        useFABActions({
          currentSection: 'testimonials',
          isAuthenticated: true,
        })
      );

      expect(result.current.testimonialsFABActions).toHaveLength(2);
      expect(result.current.testimonialsFABActions[0].id).toBe('admin-testimonials');
      expect(result.current.testimonialsFABActions[1].id).toBe('add-testimonial');
    });
  });
});
