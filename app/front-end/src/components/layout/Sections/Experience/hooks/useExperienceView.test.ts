import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExperienceView } from './useExperienceView';

describe('useExperienceView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with traditional view mode', () => {
    const { result } = renderHook(() => useExperienceView());

    expect(result.current.viewMode).toBe('traditional');
  });

  it('should switch between view modes', () => {
    const { result } = renderHook(() => useExperienceView());

    // Switch to chronological
    act(() => {
      result.current.handleViewModeChange('chronological');
    });

    expect(result.current.viewMode).toBe('chronological');

    // Switch back to traditional
    act(() => {
      result.current.handleViewModeChange('traditional');
    });

    expect(result.current.viewMode).toBe('traditional');
  });

  it('should provide view mode toggle function', () => {
    const { result } = renderHook(() => useExperienceView());

    expect(typeof result.current.toggleViewMode).toBe('function');

    // Initial state is traditional
    expect(result.current.viewMode).toBe('traditional');

    // Toggle to chronological
    act(() => {
      result.current.toggleViewMode();
    });

    expect(result.current.viewMode).toBe('chronological');

    // Toggle back to traditional
    act(() => {
      result.current.toggleViewMode();
    });

    expect(result.current.viewMode).toBe('traditional');
  });

  it('should provide view mode check utilities', () => {
    const { result } = renderHook(() => useExperienceView());

    // Initial state - traditional
    expect(result.current.isTraditionalView).toBe(true);
    expect(result.current.isChronologicalView).toBe(false);

    // Switch to chronological
    act(() => {
      result.current.handleViewModeChange('chronological');
    });

    expect(result.current.isTraditionalView).toBe(false);
    expect(result.current.isChronologicalView).toBe(true);
  });

  it('should persist view mode in localStorage', () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });

    mockLocalStorage.getItem.mockReturnValue('"chronological"');

    const { result } = renderHook(() => useExperienceView());

    // Should initialize with saved value
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('experience-view-mode');

    // Change view mode
    act(() => {
      result.current.handleViewModeChange('traditional');
    });

    // Should save to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('experience-view-mode', '"traditional"');
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage that throws errors
    const mockLocalStorage = {
      getItem: vi.fn(() => {
        throw new Error('Storage error');
      }),
      setItem: vi.fn(() => {
        throw new Error('Storage error');
      }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });

    // Should not throw and default to traditional
    const { result } = renderHook(() => useExperienceView());

    expect(result.current.viewMode).toBe('traditional');

    // Should not throw when setting
    act(() => {
      result.current.handleViewModeChange('chronological');
    });

    expect(result.current.viewMode).toBe('chronological');
  });
});
