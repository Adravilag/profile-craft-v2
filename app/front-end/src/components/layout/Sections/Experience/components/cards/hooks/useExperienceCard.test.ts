import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExperienceCard } from './useExperienceCard';
import type { Experience } from '@/types/api';

const mockExperience: Experience = {
  _id: '1',
  position: 'Senior Developer',
  company: 'Tech Corp',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  description: 'Desarrollo de aplicaciones web',
  technologies: ['React', 'TypeScript', 'Node.js'],
  is_current: false,
  order_index: 1,
  user_id: '1',
};

describe('useExperienceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct hover state', () => {
    const { result } = renderHook(() =>
      useExperienceCard({
        experience: mockExperience,
        index: 0,
      })
    );

    expect(result.current.isHovered).toBe(false);
  });

  it('should handle mouse enter and leave events', () => {
    const { result } = renderHook(() =>
      useExperienceCard({
        experience: mockExperience,
        index: 0,
      })
    );

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
      useExperienceCard({
        experience: mockExperience,
        index: 0,
      })
    );

    expect(result.current.formattedDateRange).toBe('2023-01-01 - 2023-12-31');
  });

  it('should handle current position formatting', () => {
    const currentExp: Experience = {
      ...mockExperience,
      end_date: '',
      is_current: true,
    };

    const { result } = renderHook(() =>
      useExperienceCard({
        experience: currentExp,
        index: 0,
      })
    );

    expect(result.current.formattedDateRange).toBe('2023-01-01 - Presente');
  });

  it('should provide animation delay based on index', () => {
    const { result } = renderHook(() =>
      useExperienceCard({
        experience: mockExperience,
        index: 2,
        animationDelay: 0.1,
      })
    );

    expect(result.current.animationDelay).toBe('200ms');
  });

  it('should handle edit action', () => {
    const mockOnEdit = vi.fn();
    const { result } = renderHook(() =>
      useExperienceCard({
        experience: mockExperience,
        index: 0,
        onEdit: mockOnEdit,
      })
    );

    act(() => {
      result.current.handleEdit();
    });

    expect(mockOnEdit).toHaveBeenCalledWith({
      _id: '1',
      id: undefined,
      title: 'Senior Developer',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      description: 'Desarrollo de aplicaciones web',
      type: 'experience',
      company: 'Tech Corp',
      technologies: ['React', 'TypeScript', 'Node.js'],
    });
  });

  it('should format technologies list', () => {
    const { result } = renderHook(() =>
      useExperienceCard({
        experience: mockExperience,
        index: 0,
      })
    );

    expect(result.current.technologiesList).toEqual(['React', 'TypeScript', 'Node.js']);
  });

  it('should handle experience without technologies', () => {
    const expNoTech: Experience = {
      ...mockExperience,
      technologies: undefined,
    };

    const { result } = renderHook(() =>
      useExperienceCard({
        experience: expNoTech,
        index: 0,
      })
    );

    expect(result.current.technologiesList).toEqual([]);
  });

  it('should format item correctly for ChronologicalCard', () => {
    const { result } = renderHook(() =>
      useExperienceCard({
        experience: mockExperience,
        index: 0,
      })
    );

    expect(result.current.formattedItem).toEqual({
      _id: '1',
      id: undefined,
      title: 'Senior Developer',
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      description: 'Desarrollo de aplicaciones web',
      type: 'experience',
      company: 'Tech Corp',
      technologies: ['React', 'TypeScript', 'Node.js'],
    });
  });
});
