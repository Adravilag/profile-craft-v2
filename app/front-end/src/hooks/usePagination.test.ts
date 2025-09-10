import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import usePagination from './usePagination';

// Mock scrollIntoView and scrollTo
const mockScrollIntoView = vi.fn();
const mockScrollTo = vi.fn();

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
});

Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

// Mock querySelector
const mockQuerySelector = vi.fn();
Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
  writable: true,
});

describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 50, itemsPerPage: 10 }));

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(5);
      expect(result.current.isChangingPage).toBe(false);
    });

    it('should initialize with custom initial page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, itemsPerPage: 10, initialPage: 3 })
      );

      expect(result.current.currentPage).toBe(3);
    });

    it('should calculate total pages correctly', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 23, itemsPerPage: 5 }));

      expect(result.current.totalPages).toBe(5); // Math.ceil(23/5) = 5
    });

    it('should handle zero items correctly', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 0, itemsPerPage: 10 }));

      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPage).toBe(1);
    });

    it('should handle single item correctly', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 1, itemsPerPage: 10 }));

      expect(result.current.totalPages).toBe(1);
    });
  });

  describe('Page calculations and boundary conditions', () => {
    it('should adjust current page when total pages decrease', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => usePagination({ totalItems, itemsPerPage: 10 }),
        { initialProps: { totalItems: 50 } }
      );

      // Start on page 5
      act(() => {
        result.current.handlePageChange(5);
        vi.runAllTimers();
      });

      expect(result.current.currentPage).toBe(5);

      // Reduce total items so that page 5 no longer exists
      rerender({ totalItems: 25 }); // Now only 3 pages

      expect(result.current.currentPage).toBe(3); // Should adjust to last valid page
    });

    it('should handle page change to invalid high page number', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 30, itemsPerPage: 10 }));

      act(() => {
        result.current.handlePageChange(10); // Only 3 pages exist
        vi.runAllTimers();
      });

      expect(result.current.currentPage).toBe(3); // Should clamp to max page
    });

    it('should handle page change to invalid low page number', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 30, itemsPerPage: 10 }));

      act(() => {
        result.current.handlePageChange(-1);
        vi.runAllTimers();
      });

      expect(result.current.currentPage).toBe(1); // Should clamp to min page
    });

    it('should handle page change to zero', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 30, itemsPerPage: 10 }));

      act(() => {
        result.current.handlePageChange(0);
        vi.runAllTimers();
      });

      expect(result.current.currentPage).toBe(1); // Should clamp to min page
    });
  });

  describe('paginatedItems function', () => {
    it('should return correct items for first page', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 25, itemsPerPage: 5 }));

      const items = Array.from({ length: 25 }, (_, i) => `item-${i}`);
      const paginatedItems = result.current.paginatedItems(items);

      expect(paginatedItems).toEqual(['item-0', 'item-1', 'item-2', 'item-3', 'item-4']);
    });

    it('should return correct items for middle page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 25, itemsPerPage: 5, initialPage: 3 })
      );

      const items = Array.from({ length: 25 }, (_, i) => `item-${i}`);
      const paginatedItems = result.current.paginatedItems(items);

      expect(paginatedItems).toEqual(['item-10', 'item-11', 'item-12', 'item-13', 'item-14']);
    });

    it('should return correct items for last page with partial items', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 23, itemsPerPage: 5, initialPage: 5 })
      );

      const items = Array.from({ length: 23 }, (_, i) => `item-${i}`);
      const paginatedItems = result.current.paginatedItems(items);

      expect(paginatedItems).toEqual(['item-20', 'item-21', 'item-22']);
    });

    it('should handle empty array', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 0, itemsPerPage: 5 }));

      const paginatedItems = result.current.paginatedItems([]);
      expect(paginatedItems).toEqual([]);
    });

    it('should work with different data types', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 6, itemsPerPage: 3 }));

      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' },
        { id: 6, name: 'Item 6' },
      ];

      const paginatedItems = result.current.paginatedItems(items);
      expect(paginatedItems).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ]);
    });
  });

  describe('Page change handling and smooth transitions', () => {
    it('should set isChangingPage to true during transition', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 30, itemsPerPage: 10 }));

      act(() => {
        result.current.handlePageChange(2);
      });

      expect(result.current.isChangingPage).toBe(true);

      act(() => {
        vi.runAllTimers();
      });

      expect(result.current.isChangingPage).toBe(false);
    });

    it('should not change page if same page is requested', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 30, itemsPerPage: 10 }));

      const initialPage = result.current.currentPage;

      act(() => {
        result.current.handlePageChange(1); // Same as current page
      });

      expect(result.current.currentPage).toBe(initialPage);
      expect(result.current.isChangingPage).toBe(false);
    });

    it('should update current page after transition', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 30, itemsPerPage: 10 }));

      act(() => {
        result.current.handlePageChange(3);
        vi.runAllTimers();
      });

      expect(result.current.currentPage).toBe(3);
    });
  });

  describe('Auto-scroll behavior', () => {
    it('should scroll to projects section when available', () => {
      const mockElement = { scrollIntoView: mockScrollIntoView };
      mockQuerySelector.mockReturnValueOnce(mockElement);

      const { result } = renderHook(() => usePagination({ totalItems: 30, itemsPerPage: 10 }));

      act(() => {
        result.current.handlePageChange(2);
        vi.runAllTimers();
      });

      expect(mockQuerySelector).toHaveBeenCalledWith('[data-section="projects"]');
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('should try alternative selectors if first one fails', () => {
      const mockElement = { scrollIntoView: mockScrollIntoView };
      mockQuerySelector
        .mockReturnValueOnce(null) // First selector fails
        .mockReturnValueOnce(mockElement); // Second selector succeeds

      const { result } = renderHook(() => usePagination({ totalItems: 30, itemsPerPage: 10 }));

      act(() => {
        result.current.handlePageChange(2);
        vi.runAllTimers();
      });

      expect(mockQuerySelector).toHaveBeenCalledWith('[data-section="projects"]');
      expect(mockQuerySelector).toHaveBeenCalledWith('#projects');
      expect(mockScrollIntoView).toHaveBeenCalled();
    });

    it('should fallback to window.scrollTo if no element found', () => {
      mockQuerySelector.mockReturnValue(null); // All selectors fail

      const { result } = renderHook(() => usePagination({ totalItems: 30, itemsPerPage: 10 }));

      act(() => {
        result.current.handlePageChange(2);
        vi.runAllTimers();
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });
  });

  describe('Dynamic options updates', () => {
    it('should recalculate total pages when totalItems changes', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => usePagination({ totalItems, itemsPerPage: 10 }),
        { initialProps: { totalItems: 50 } }
      );

      expect(result.current.totalPages).toBe(5);

      rerender({ totalItems: 75 });
      expect(result.current.totalPages).toBe(8);
    });

    it('should recalculate total pages when itemsPerPage changes', () => {
      const { result, rerender } = renderHook(
        ({ itemsPerPage }) => usePagination({ totalItems: 50, itemsPerPage }),
        { initialProps: { itemsPerPage: 10 } }
      );

      expect(result.current.totalPages).toBe(5);

      rerender({ itemsPerPage: 5 });
      expect(result.current.totalPages).toBe(10);
    });

    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() =>
        usePagination({ totalItems: 50, itemsPerPage: 10 })
      );

      const firstPaginatedItems = result.current.paginatedItems;
      const firstHandlePageChange = result.current.handlePageChange;

      rerender();

      expect(result.current.paginatedItems).toBe(firstPaginatedItems);
      expect(result.current.handlePageChange).toBe(firstHandlePageChange);
    });
  });

  describe('Edge cases', () => {
    it('should handle very large numbers', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 1000000, itemsPerPage: 100 })
      );

      expect(result.current.totalPages).toBe(10000);

      act(() => {
        result.current.handlePageChange(5000);
        vi.runAllTimers();
      });

      expect(result.current.currentPage).toBe(5000);
    });

    it('should handle itemsPerPage of 1', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 5, itemsPerPage: 1 }));

      expect(result.current.totalPages).toBe(5);

      const items = ['a', 'b', 'c', 'd', 'e'];
      expect(result.current.paginatedItems(items)).toEqual(['a']);

      act(() => {
        result.current.handlePageChange(3);
        vi.runAllTimers();
      });

      expect(result.current.paginatedItems(items)).toEqual(['c']);
    });

    it('should handle very large itemsPerPage', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 10, itemsPerPage: 1000 }));

      expect(result.current.totalPages).toBe(1);

      const items = Array.from({ length: 10 }, (_, i) => i);
      expect(result.current.paginatedItems(items)).toEqual(items);
    });
  });
});
