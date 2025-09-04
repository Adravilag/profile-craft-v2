// src/components/layout/RootLayout/hooks/useFABActions.auth.test.tsx

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFABActions } from './useFABActions';

// Mock de las dependencias
vi.mock('@/contexts/FabContext', () => ({
  useFab: () => ({
    openTestimonialModal: vi.fn(),
    openTestimonialsAdmin: vi.fn(),
    openSkillModal: vi.fn(),
    onOpenExperienceModal: vi.fn(),
    openAboutModal: vi.fn(),
  }),
}));

vi.mock('@/contexts/ModalContext', () => ({
  useModal: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('[TEST] useFABActions - Control de autenticación', () => {
  it('[TEST] debe ocultar botón "Añadir Proyecto" cuando no está autenticado', () => {
    const { result } = renderHook(() =>
      useFABActions({
        currentSection: 'projects',
        isAuthenticated: false, // Usuario NO autenticado
      })
    );

    // Verificar que no hay acciones de proyectos para usuarios no autenticados
    expect(result.current.projectsFABActions).toEqual([]);
  });

  it('[TEST] debe mostrar botones de proyectos solo cuando está autenticado', () => {
    const { result } = renderHook(() =>
      useFABActions({
        currentSection: 'projects',
        isAuthenticated: true, // Usuario autenticado
      })
    );

    // Debe tener ambos botones: Gestionar y Añadir
    expect(result.current.projectsFABActions).toHaveLength(2);
    expect(result.current.projectsFABActions[0].id).toBe('admin-projects');
    expect(result.current.projectsFABActions[1].id).toBe('add-project');
  });

  it('[TEST] debe ocultar botón "Añadir Habilidad" cuando no está autenticado', () => {
    const { result } = renderHook(() =>
      useFABActions({
        currentSection: 'skills',
        isAuthenticated: false, // Usuario NO autenticado
      })
    );

    // Verificar que no hay acciones de skills para usuarios no autenticados
    expect(result.current.skillsFABActions).toEqual([]);
  });

  it('[TEST] debe mostrar botón "Añadir Habilidad" solo cuando está autenticado', () => {
    const { result } = renderHook(() =>
      useFABActions({
        currentSection: 'skills',
        isAuthenticated: true, // Usuario autenticado
      })
    );

    // Debe tener el botón de añadir habilidades
    expect(result.current.skillsFABActions).toHaveLength(1);
    expect(result.current.skillsFABActions[0].id).toBe('add-skill');
    expect(result.current.skillsFABActions[0].label).toBe('Añadir Habilidad');
  });
});
