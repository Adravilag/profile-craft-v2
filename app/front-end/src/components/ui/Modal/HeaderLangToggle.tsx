import React from 'react';

interface Props {
  lang: 'es' | 'en';
  onChange?: (lang: 'es' | 'en') => void;
  className?: string;
}

const HeaderLangToggle: React.FC<Props> = ({ lang, onChange, className }) => {
  return (
    <div className={className} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button
        type="button"
        aria-pressed={lang === 'es'}
        onClick={() => onChange?.('es')}
        className="header-lang-btn"
        style={{ padding: '6px 8px', borderRadius: 6 }}
      >
        ES
      </button>
      <button
        type="button"
        aria-pressed={lang === 'en'}
        onClick={() => onChange?.('en')}
        className="header-lang-btn"
        style={{ padding: '6px 8px', borderRadius: 6 }}
      >
        EN
      </button>
    </div>
  );
};

export default HeaderLangToggle;
