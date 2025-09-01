// src/components/common/TranslatedBreadcrumbs/TranslatedBreadcrumbs.tsx
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import styles from './TranslatedBreadcrumbs.module.css';

interface BreadcrumbItem {
  key: string;
  translationPath: string;
  href?: string;
  isActive?: boolean;
}

interface TranslatedBreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: string;
  className?: string;
}

const TranslatedBreadcrumbs: React.FC<TranslatedBreadcrumbsProps> = ({
  items,
  separator = '/',
  className = '',
}) => {
  const { getText } = useTranslation();

  const handleNavigate = (href?: string) => {
    if (href) {
      if (href.startsWith('#')) {
        // Navigation within the same page
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // External navigation
        window.location.href = href;
      }
    }
  };

  return (
    <nav className={`${styles.breadcrumbs} ${className}`} aria-label="Breadcrumb navigation">
      <ol className={styles.breadcrumbList}>
        {items.map((item, index) => (
          <li key={item.key} className={styles.breadcrumbItem}>
            {item.href && !item.isActive ? (
              <button
                type="button"
                className={styles.breadcrumbLink}
                onClick={() => handleNavigate(item.href)}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {getText(item.translationPath)}
              </button>
            ) : (
              <span
                className={`${styles.breadcrumbText} ${item.isActive ? styles.active : ''}`}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {getText(item.translationPath)}
              </span>
            )}
            {index < items.length - 1 && (
              <span className={styles.separator} aria-hidden="true">
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default TranslatedBreadcrumbs;
