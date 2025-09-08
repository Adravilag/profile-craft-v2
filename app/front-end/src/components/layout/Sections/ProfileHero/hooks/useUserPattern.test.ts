import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del endpoint antes que todo
vi.mock('@/services/endpoints', () => ({
  profile: {
    getUserPattern: vi.fn(),
  },
}));

import { useUserPattern } from './useUserPattern';
import { profile } from '@/services/endpoints';

describe('useUserPattern', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load pattern successfully', async () => {
    // Arrange
    const mockUserId = '684965a62ebed45b3deabedd';
    const mockPattern = '1708';
    (profile.getUserPattern as any).mockResolvedValue(mockPattern);

    // Act
    const { result } = renderHook(() => useUserPattern(mockUserId));

    // Assert initial state
    expect(result.current.pattern).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for pattern to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pattern).toBe(mockPattern);
    expect(result.current.error).toBeNull();
    expect(profile.getUserPattern).toHaveBeenCalledWith(mockUserId);
  });

  it('should handle errors when loading pattern', async () => {
    // Arrange
    const mockUserId = 'invalid-id';
    const mockError = new Error('Pattern not found');
    (profile.getUserPattern as any).mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useUserPattern(mockUserId));

    // Wait for error
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.pattern).toBeNull();
    expect(result.current.error).toBe('Failed to load pattern');
    expect(profile.getUserPattern).toHaveBeenCalledWith(mockUserId);
  });

  it('should not load pattern when userId is null', () => {
    // Act
    const { result } = renderHook(() => useUserPattern(null));

    // Assert
    expect(result.current.pattern).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(profile.getUserPattern).not.toHaveBeenCalled();
  });
});
