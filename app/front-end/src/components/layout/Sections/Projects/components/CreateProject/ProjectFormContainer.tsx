// src/components/sections/projects/ProjectFormContainer.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProjectFormContainer.module.css';
import { useTranslation } from '@/contexts/TranslationContext';

interface ProjectFormContainerProps {
  children: React.ReactNode;
  title: string;
  icon: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonTo?: string;
  backButtonText?: string;
  showThemeToggle?: boolean;
  language?: 'es' | 'en';
  onLanguageChange?: (lang: 'es' | 'en') => void;
}

const ProjectFormContainer: React.FC<ProjectFormContainerProps> = ({
  children,
  title,
  icon,
  subtitle,
  showBackButton = true,
  backButtonTo = '/projects/admin',
  backButtonText = undefined,
  language = 'es',
  onLanguageChange,
}) => {
  const { getText } = useTranslation();
  const backText =
    backButtonText || getText('projects.form.actions.backToAdmin', 'Volver a administración');
  // Scroll is now handled globally by ScrollToTop; keep Link simple

  return (
    <div className={styles.formContainer}>
      {/* Header con estructura unificada */}
      <header className={styles.formHeader}>
        <div className={styles.headerLeft}>
          {showBackButton && (
            <Link to={backButtonTo} className={styles.backButton} aria-label={backText}>
              <i className="fas fa-arrow-left" aria-hidden="true"></i>
              <span>{backText}</span>
            </Link>
          )}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <i className={icon}></i>
              {title}
            </h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
      </header>

      <main className={styles.formMain}>
        <div className={styles.formContent}>{children}</div>
      </main>
    </div>
  );
};

export default ProjectFormContainer;
