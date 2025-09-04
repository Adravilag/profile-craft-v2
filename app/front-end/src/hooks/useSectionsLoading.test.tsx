/**
 * [TEST] useSectionsLoading - Loading State Management
 *
 * Test para un hook centralizado que maneje el estado de loading
 * de todas las secciones de la aplicación.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSectionsLoading } from './useSectionsLoading';

type SectionName =
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'certifications'
  | 'testimonials'
  | 'contact';

describe('[TEST] useSectionsLoading - Centralized Loading State', () => {
  it('🔴 should initialize with all sections loading as false', () => {
    // [TEST] - Rojo: Verificar estado inicial

    const { result } = renderHook(() => useSectionsLoading());

    expect(result.current.isLoading('about')).toBe(false);
    expect(result.current.isLoading('skills')).toBe(false);
    expect(result.current.isLoading('experience')).toBe(false);
    expect(result.current.isLoading('projects')).toBe(false);
    expect(result.current.isLoading('certifications')).toBe(false);
    expect(result.current.isLoading('testimonials')).toBe(false);
    expect(result.current.isLoading('contact')).toBe(false);
  });

  it('🔴 should set specific section loading state', () => {
    // [TEST] - Rojo: Verificar cambio de estado individual

    const { result } = renderHook(() => useSectionsLoading());

    act(() => {
      result.current.setLoading('skills', true);
    });

    expect(result.current.isLoading('skills')).toBe(true);
    expect(result.current.isLoading('about')).toBe(false); // Otras secciones no afectadas
  });

  it('🔴 should check if any section is loading', () => {
    // [TEST] - Rojo: Verificar si alguna sección está cargando

    const { result } = renderHook(() => useSectionsLoading());

    expect(result.current.isAnyLoading()).toBe(false);

    act(() => {
      result.current.setLoading('experience', true);
    });

    expect(result.current.isAnyLoading()).toBe(true);
  });

  it('🔴 should get all loading sections', () => {
    // [TEST] - Rojo: Verificar obtención de secciones cargando

    const { result } = renderHook(() => useSectionsLoading());

    act(() => {
      result.current.setLoading('skills', true);
      result.current.setLoading('projects', true);
    });

    const loadingSections = result.current.getLoadingSections();
    expect(loadingSections).toContain('skills');
    expect(loadingSections).toContain('projects');
    expect(loadingSections).toHaveLength(2);
  });

  it('🔴 should reset all loading states', () => {
    // [TEST] - Rojo: Verificar reset de todos los estados

    const { result } = renderHook(() => useSectionsLoading());

    act(() => {
      result.current.setLoading('about', true);
      result.current.setLoading('skills', true);
      result.current.setLoading('experience', true);
    });

    expect(result.current.isAnyLoading()).toBe(true);

    act(() => {
      result.current.resetAllLoading();
    });

    expect(result.current.isAnyLoading()).toBe(false);
    expect(result.current.getLoadingSections()).toHaveLength(0);
  });

  it('🔴 should set multiple sections loading at once', () => {
    // [TEST] - Rojo: Verificar establecer múltiples secciones cargando

    const { result } = renderHook(() => useSectionsLoading());

    act(() => {
      result.current.setMultipleLoading(['skills', 'projects', 'certifications'], true);
    });

    expect(result.current.isLoading('skills')).toBe(true);
    expect(result.current.isLoading('projects')).toBe(true);
    expect(result.current.isLoading('certifications')).toBe(true);
    expect(result.current.isLoading('about')).toBe(false);
  });

  it('🔴 should get loading state object', () => {
    // [TEST] - Rojo: Verificar obtención del objeto completo de estados

    const { result } = renderHook(() => useSectionsLoading());

    act(() => {
      result.current.setLoading('about', true);
      result.current.setLoading('testimonials', true);
    });

    const loadingState = result.current.getLoadingState();

    expect(loadingState).toEqual({
      about: true,
      skills: false,
      experience: false,
      projects: false,
      certifications: false,
      testimonials: true,
      contact: false,
      profile: false,
    });
  });
});
