import React from 'react';
import HeaderSection from '../../HeaderSection/HeaderSection';
import styles from './AboutSection.module.css';
import HighlightCard from '@/components/ui/HighlightCard/HighlightCard';
import { useAboutSection } from './hooks/useAboutSection';
import { useTranslation } from '@/contexts/TranslationContext';

const AboutSection: React.FC = () => {
  const { t } = useTranslation();

  // Hook principal que coordina todos los datos y funcionalidades
  const {
    aboutText,
    highlights,
    collaborationNote,
    isLoading,
    hasError,
    errorMessage,
    isAnimated,
    elementRef,
    handleNavigateToContact,
  } = useAboutSection();

  if (isLoading)
    return (
      <div className="section-cv">
        <div className={styles.aboutLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>{t.about.loadingInfo}</p>
        </div>
      </div>
    );

  if (hasError)
    return (
      <div className="section-cv">
        <div className={styles.aboutError}>
          <i className="fas fa-exclamation-triangle"></i>
          <p>{errorMessage || t.about.errorLoading}</p>
        </div>
      </div>
    );

  if (!aboutText && !highlights.length) return null;

  return (
    <div className="section-cv" ref={elementRef}>
      <HeaderSection
        icon="fas fa-user"
        title={t.about.title}
        subtitle={t.about.subtitle}
        className="about"
      />

      <div className="section-container">
        {aboutText && (
          <div className={styles.aboutDescription}>
            <div className="about-text" dangerouslySetInnerHTML={{ __html: aboutText }} />
          </div>
        )}

        {highlights.length > 0 && (
          <div className={styles.aboutHighlights}>
            {highlights.map((card, index) => (
              <HighlightCard
                key={card._id || index}
                icon={typeof card.icon === 'string' ? <i className={card.icon} /> : card.icon}
                title={card.title}
                descriptionHtml={card.descriptionHtml}
                tech={card.tech}
                imageSrc={card.imageSrc}
              />
            ))}
          </div>
        )}

        <div
          className={styles.aboutCollaborationNote}
          onClick={handleNavigateToContact}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNavigateToContact();
            }
          }}
          aria-label={t.about.navigateToContact}
        >
          <div className={styles.aboutCollabIcon}>
            {collaborationNote?.icon ? <i className={collaborationNote.icon} /> : '🤝'}
          </div>
          <div className={styles.aboutCollabContent}>
            <h4>{collaborationNote?.title || t.about.collaborationTitle}</h4>
            <p>{collaborationNote?.description || t.about.collaborationDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
