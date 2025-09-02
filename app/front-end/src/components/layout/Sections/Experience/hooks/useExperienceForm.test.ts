import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExperienceForm } from './useExperienceForm';
import type { Experience } from '@/types/api';

const mockExperience: Experience = {
  _id: '1',
  position: 'Senior Developer',
  company: 'Tech Corp',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  description: 'Desarrollo de aplicaciones web',
  technologies: ['React', 'TypeScript'],
  is_current: false,
  order_index: 1,
  user_id: '1',
};

describe('useExperienceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty form for new experience', () => {
    const { result } = renderHook(() => useExperienceForm());

    expect(result.current.formData.title).toBe('');
    expect(result.current.formData.company).toBe('');
    expect(result.current.formData.start_date).toBe('');
    expect(result.current.formData.end_date).toBe('');
    expect(result.current.formData.description).toBe('');
    expect(result.current.formData.technologies).toBe('');
    expect(result.current.isEditing).toBe(false);
  });

  it('should initialize with existing experience data for editing', () => {
    const { result } = renderHook(() => useExperienceForm(mockExperience));

    expect(result.current.formData.title).toBe('Senior Developer');
    expect(result.current.formData.company).toBe('Tech Corp');
    expect(result.current.formData.start_date).toBe('2023-01-01');
    expect(result.current.formData.end_date).toBe('2023-12-31');
    expect(result.current.formData.description).toBe('Desarrollo de aplicaciones web');
    expect(result.current.formData.technologies).toBe('React, TypeScript');
    expect(result.current.isEditing).toBe(true);
  });

  it('should update form field values', () => {
    const { result } = renderHook(() => useExperienceForm());

    act(() => {
      result.current.updateField('title', 'Frontend Developer');
    });

    expect(result.current.formData.title).toBe('Frontend Developer');

    act(() => {
      result.current.updateField('company', 'New Company');
    });

    expect(result.current.formData.company).toBe('New Company');
  });

  it('should validate required fields', () => {
    const { result } = renderHook(() => useExperienceForm());

    const validationResult = result.current.validateForm();

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain('El título es requerido');
    expect(validationResult.errors).toContain('La empresa es requerida');
    expect(validationResult.errors).toContain('La fecha de inicio es requerida');
  });

  it('should validate form with valid data', () => {
    const { result } = renderHook(() => useExperienceForm());

    act(() => {
      result.current.updateField('title', 'Developer');
      result.current.updateField('company', 'Company');
      result.current.updateField('start_date', '2023-01-01');
    });

    const validationResult = result.current.validateForm();

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toHaveLength(0);
  });

  it('should handle form submission with valid data', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useExperienceForm(undefined, mockOnSubmit));

    act(() => {
      result.current.updateField('title', 'Developer');
      result.current.updateField('company', 'Company');
      result.current.updateField('start_date', '2023-01-01');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Developer',
        company: 'Company',
        start_date: '2023-01-01',
      })
    );
  });

  it('should not submit form with invalid data', async () => {
    const mockOnSubmit = vi.fn();
    const { result } = renderHook(() => useExperienceForm(undefined, mockOnSubmit));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.length).toBeGreaterThan(0);
  });

  it('should reset form to initial state', () => {
    const { result } = renderHook(() => useExperienceForm(mockExperience));

    act(() => {
      result.current.updateField('title', 'Changed Title');
    });

    expect(result.current.formData.title).toBe('Changed Title');

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData.title).toBe('Senior Developer');
  });
});
