import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEducationCard } from './useEducationCard';

const mockEducation = {
  _id: '1',
  title: 'Computer Science',
  institution: 'Test University',
  start_date: '2020-01-01',
  end_date: '2024-01-01',
  description: 'Test education',
  grade: '9.0',
};

describe('useEducationCard', () => {
  it('should initialize with correct hover state', () => {
    const { result } = renderHook(() =>
      useEducationCard({
        education: mockEducation,
        index: 0,
      })
    );

    expect(result.current.isHovered).toBe(false);
    expect(typeof result.current.handleMouseEnter).toBe('function');
    expect(typeof result.current.handleMouseLeave).toBe('function');
    expect(typeof result.current.handleEdit).toBe('function');
  });

  it('should handle mouse enter and leave events', () => {
    const { result } = renderHook(() =>
      useEducationCard({
        education: mockEducation,
        index: 0,
      })
    );

    // Inicialmente no está hovered
    expect(result.current.isHovered).toBe(false);

    // Mouse enter
    act(() => {
      result.current.handleMouseEnter();
    });
    expect(result.current.isHovered).toBe(true);

    // Mouse leave
    act(() => {
      result.current.handleMouseLeave();
    });
    expect(result.current.isHovered).toBe(false);
  });

  it('should format date range correctly', () => {
    const { result } = renderHook(() =>
      useEducationCard({
        education: mockEducation,
        index: 0,
      })
    );

    expect(result.current.formattedDateRange).toBe('2020 - 2024');
  });

  it('should handle education in progress', () => {
    const currentEducation = {
      ...mockEducation,
      end_date: '',
    };

    const { result } = renderHook(() =>
      useEducationCard({
        education: currentEducation,
        index: 0,
      })
    );

    expect(result.current.formattedDateRange).toBe('2020 - Present');
  });

  it('should provide animation delay based on index', () => {
    const { result } = renderHook(() =>
      useEducationCard({
        education: mockEducation,
        index: 3,
        animationDelay: 0.2,
      })
    );

    expect(result.current.animationDelay).toBe('0.8s'); // 0.2 * (3 + 1)
  });

  it('should handle edit action', () => {
    const mockOnEdit = vi.fn();

    const { result } = renderHook(() =>
      useEducationCard({
        education: mockEducation,
        index: 0,
        onEdit: mockOnEdit,
      })
    );

    act(() => {
      result.current.handleEdit();
    });

    expect(mockOnEdit).toHaveBeenCalledWith(result.current.formattedItem);
  });

  it('should handle missing grade', () => {
    const educationWithoutGrade = {
      ...mockEducation,
      grade: undefined,
    };

    const { result } = renderHook(() =>
      useEducationCard({
        education: educationWithoutGrade,
        index: 0,
      })
    );

    expect(result.current.gradeDisplay).toBe('');
  });

  it('should format grade display correctly', () => {
    const { result } = renderHook(() =>
      useEducationCard({
        education: mockEducation,
        index: 0,
      })
    );

    expect(result.current.gradeDisplay).toBe('Grade: 9.0');
  });

  it('should format item correctly for ChronologicalCard', () => {
    const { result } = renderHook(() =>
      useEducationCard({
        education: mockEducation,
        index: 2,
        animationDelay: 0.15,
      })
    );

    const expectedItem = {
      _id: '1',
      id: undefined,
      title: 'Computer Science',
      start_date: '2020-01-01',
      end_date: '2024-01-01',
      description: 'Test education',
      type: 'education',
      institution: 'Test University',
      grade: '9.0',
      animationDelay: '0.45s', // 0.15 * (2 + 1)
    };

    expect(result.current.formattedItem).toEqual(expectedItem);
  });
});
