import { useState, useCallback, useMemo, useEffect } from 'react';

export interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  paginatedItems: <T>(items: T[]) => T[];
  handlePageChange: (page: number) => void;
  isChangingPage: boolean;
}

export const usePagination = (options: UsePaginationOptions): UsePaginationReturn => {
  const { totalItems, itemsPerPage, initialPage = 1 } = options;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isChangingPage, setIsChangingPage] = useState<boolean>(false);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  // Validate and adjust current page when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Function to get paginated items
  const paginatedItems = useCallback(
    <T>(items: T[]): T[] => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return items.slice(startIndex, endIndex);
    },
    [currentPage, itemsPerPage]
  );

  // Handle page change with validation and smooth transitions
  const handlePageChange = useCallback(
    (page: number) => {
      // Validate page boundaries
      const validatedPage = Math.max(1, Math.min(page, totalPages));

      if (validatedPage === currentPage) {
        return; // No change needed
      }

      setIsChangingPage(true);

      // Smooth transition with loading state
      setTimeout(() => {
        setCurrentPage(validatedPage);

        // Auto-scroll behavior - scroll to top of the section
        // Using a small delay to ensure DOM updates are complete
        setTimeout(() => {
          const element =
            document.querySelector('[data-section="projects"]') ||
            document.querySelector('#projects') ||
            document.querySelector('.projects-section');

          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          } else {
            // Fallback: scroll to top of page
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }

          setIsChangingPage(false);
        }, 100);
      }, 150); // Small delay for smooth UX
    },
    [currentPage, totalPages]
  );

  return {
    currentPage,
    totalPages,
    paginatedItems,
    handlePageChange,
    isChangingPage,
  } as const;
};

export default usePagination;
