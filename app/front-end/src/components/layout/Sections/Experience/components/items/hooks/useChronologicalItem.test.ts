import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChronologicalItem } from './useChronologicalItem';

const mockChronologicalItem = {
  _id: '1',
  title: 'Senior Developer',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  description: 'Desarrollo de aplicaciones',
  type: 'experience' as const,
  company: 'Tech Corp',
  technologies: ['React', 'TypeScript'],
};

describe('useChronologicalItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct animation state', () => {
    const { result } = renderHook(() => useChronologicalItem(mockChronologicalItem, 0, 'left'));

    expect(result.current.isVisible).toBe(false);
    expect(result.current.isAnimating).toBe(false);
  });

  it('should handle visibility animation trigger', () => {
    const { result } = renderHook(() => useChronologicalItem(mockChronologicalItem, 0, 'left'));

    act(() => {
      result.current.triggerAnimation();
    });

    expect(result.current.isVisible).toBe(true);
    expect(result.current.isAnimating).toBe(true);
  });

  it('should provide correct CSS classes for left position', () => {
    const { result } = renderHook(() => useChronologicalItem(mockChronologicalItem, 0, 'left'));

    expect(result.current.positionClass).toBe('chronological-item-left');
  });

  it('should provide correct CSS classes for right position', () => {
    const { result } = renderHook(() => useChronologicalItem(mockChronologicalItem, 1, 'right'));

    expect(result.current.positionClass).toBe('chronological-item-right');
  });

  it('should calculate animation delay based on index', () => {
    const { result } = renderHook(() => useChronologicalItem(mockChronologicalItem, 3, 'left'));

    expect(result.current.animationDelay).toBe('300ms');
  });

  it('should format timeline date correctly', () => {
    const { result } = renderHook(() => useChronologicalItem(mockChronologicalItem, 0, 'left'));

    expect(result.current.timelineDate).toBe('2023');
  });

  it('should handle edit action', () => {
    const mockOnEdit = vi.fn();
    const { result } = renderHook(() =>
      useChronologicalItem(mockChronologicalItem, 0, 'left', mockOnEdit)
    );

    act(() => {
      result.current.handleEdit();
    });

    expect(mockOnEdit).toHaveBeenCalledWith(mockChronologicalItem);
  });

  it('should provide item type icon', () => {
    const { result } = renderHook(() => useChronologicalItem(mockChronologicalItem, 0, 'left'));

    expect(result.current.typeIcon).toBe('fas fa-briefcase');
  });

  it('should provide education type icon', () => {
    const educationItem = {
      ...mockChronologicalItem,
      type: 'education' as const,
      institution: 'University',
    };

    const { result } = renderHook(() => useChronologicalItem(educationItem, 0, 'left'));

    expect(result.current.typeIcon).toBe('fas fa-graduation-cap');
  });

  it('should handle hover states', () => {
    const { result } = renderHook(() => useChronologicalItem(mockChronologicalItem, 0, 'left'));

    expect(result.current.isHovered).toBe(false);

    act(() => {
      result.current.handleMouseEnter();
    });

    expect(result.current.isHovered).toBe(true);

    act(() => {
      result.current.handleMouseLeave();
    });

    expect(result.current.isHovered).toBe(false);
  });
});
