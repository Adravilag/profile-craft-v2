import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
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
