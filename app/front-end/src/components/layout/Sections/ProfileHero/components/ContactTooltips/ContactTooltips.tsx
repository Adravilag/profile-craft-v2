// src/components/header/ContactTooltips.tsx
import React, { useState } from 'react';
import './ContactTooltips.css';

interface ContactInfo {
  type: 'email' | 'linkedin' | 'github' | 'location';
  icon: string;
  value: string;
  action?: () => void;
  color: string;
}

interface ContactTooltipsProps {
  contacts: ContactInfo[];
  compact?: boolean;
}

const ContactTooltips: React.FC<ContactTooltipsProps> = ({ contacts, compact = false }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleIconClick = (type: string, action?: () => void) => {
    if (action) {
      action();
    } else {
      setActiveTooltip(activeTooltip === type ? null : type);
    }
  };

  const getActionForContact = (contact: ContactInfo) => {
    switch (contact.type) {
      case 'email':
        return () => (window.location.href = `mailto:${contact.value}`);
      case 'linkedin':
      case 'github':
        return () => window.open(contact.value, '_blank');
      case 'location':
        return () =>
          window.open(`https://maps.google.com?q=${encodeURIComponent(contact.value)}`, '_blank');
      default:
        return undefined;
    }
  };

  return (
    <div className={`contact-tooltips ${compact ? 'compact' : ''}`}>
      {contacts.map(contact => (
        <div
          key={contact.type}
          className="contact-item"
          style={{ '--contact-color': contact.color } as React.CSSProperties}
        >
          <button
            className={`contact-icon ${activeTooltip === contact.type ? 'active' : ''}`}
            onClick={() => handleIconClick(contact.type, getActionForContact(contact))}
            onBlur={() => setTimeout(() => setActiveTooltip(null), 150)}
            aria-label={`${contact.type}: ${contact.value}`}
            data-contact-type={contact.type}
          >
            <i className={contact.icon} />
          </button>

          {activeTooltip === contact.type && (
            <div className="contact-tooltip">
              <div className="tooltip-content">
                <span className="tooltip-label">{contact.type}</span>
                <span className="tooltip-value">{contact.value}</span>
                <div className="tooltip-actions">
                  <button className="tooltip-action primary" onClick={getActionForContact(contact)}>
                    {contact.type === 'email'
                      ? 'Enviar'
                      : contact.type === 'location'
                        ? 'Ver mapa'
                        : 'Abrir'}
                  </button>
                  <button
                    className="tooltip-action secondary"
                    onClick={() => navigator.clipboard.writeText(contact.value)}
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <div className="tooltip-arrow" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContactTooltips;
