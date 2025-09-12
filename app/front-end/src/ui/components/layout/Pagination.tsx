import styles from './Pagination.module.css';
import { useTranslation } from '@/contexts/TranslationContext';

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showInfo?: boolean;
  // Accept legacy/extra props without using them to keep callers compatible
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  showInfo = false,
}: PaginationProps) {
  const { getText } = useTranslation();
  const prev = () => onPageChange(Math.max(1, (currentPage || 1) - 1));
  const next = () => onPageChange(Math.min(totalPages || 1, (currentPage || 1) + 1));

  return (
    <nav
      className={styles.pagination}
      aria-label="pagination"
      role="navigation"
      data-testid="pagination"
    >
      <button
        className={styles.button}
        onClick={prev}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        data-testid="prev-page"
      >
        {getText('actions.previous', 'Prev')}
      </button>

      <div className={styles.info} aria-live="polite">
        {showInfo ? (
          <span data-testid="page-info">
            {currentPage} {getText('projectsCarousel.projectOf', 'of')} {totalPages}
          </span>
        ) : (
          <span className={styles.counter}>
            {currentPage} / {totalPages}
          </span>
        )}
      </div>

      <button
        className={styles.button}
        onClick={next}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        data-testid="next-page"
      >
        {getText('actions.next', 'Next')}
      </button>
    </nav>
  );
}
