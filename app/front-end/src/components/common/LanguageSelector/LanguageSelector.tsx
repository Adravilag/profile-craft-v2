// src/components/common/LanguageSelector/LanguageSelector.tsx
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import styles from './LanguageSelector.module.css';

interface LanguageSelectorProps {
  variant?: 'button' | 'dropdown' | 'toggle';
  showLabel?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'toggle',
  showLabel = false,
  className = '',
}) => {
  const { language, setLanguage, toggleLanguage, t } = useTranslation();

  if (variant === 'toggle') {
    return (
      <button
        type="button"
        className={`${styles.languageToggle} ${className}`}
        onClick={toggleLanguage}
        title={t.profileHero.toggleLanguage}
        aria-label={t.profileHero.toggleLanguage}
      >
        {showLabel && <span className={styles.label}>{t.profileHero.toggleLanguage}</span>}
        <span className={styles.currentLang}>{language.toUpperCase()}</span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`${styles.languageDropdown} ${className}`}>
        {showLabel && <label className={styles.label}>{t.profileHero.toggleLanguage}</label>}
        <select
          value={language}
          onChange={e => setLanguage(e.target.value as 'es' | 'en')}
          className={styles.select}
          aria-label={t.profileHero.toggleLanguage}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>
    );
  }

  // variant === 'button'
  return (
    <div className={`${styles.languageButtons} ${className}`}>
      {showLabel && <span className={styles.label}>{t.profileHero.toggleLanguage}:</span>}
      <button
        type="button"
        className={`${styles.langButton} ${language === 'es' ? styles.active : ''}`}
        onClick={() => setLanguage('es')}
        aria-pressed={language === 'es'}
      >
        ES
      </button>
      <button
        type="button"
        className={`${styles.langButton} ${language === 'en' ? styles.active : ''}`}
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector;
