import React from 'react';

interface HeaderSectionProps {
  icon: string;
  title: string;
  subtitle: string;
  className?: string;
  showNotification?: boolean;
  notificationMessage?: string;
  notificationIcon?: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  icon,
  title,
  subtitle,
  className = '',
  showNotification = false,
  notificationMessage,
  notificationIcon = 'fas fa-info-circle',
}) => {
  return (
    <div className={`section-header ${className}`}>
      <div className="section-title">
        <div className="section-title-icon">
          <i className={icon}></i>
        </div>
        <h2 className="section-title-text">{title}</h2>
      </div>{' '}
      <p className="section-subtitle">{subtitle}</p>
      <hr
        className="section-divider"
        style={{
          height: '2px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.3) 20%, rgba(139, 92, 246, 0.5) 50%, rgba(99, 102, 241, 0.3) 80%, transparent 100%)',
          border: 'none',
          margin: '1.5rem auto',
          maxWidth: '300px',
          borderRadius: '2px',
          opacity: '0.8',
        }}
      />
      {/* Notificación de estado opcional */}
      {showNotification && notificationMessage && (
        <div className="status-notification">
          <i className={notificationIcon}></i>
          <span>{notificationMessage}</span>
        </div>
      )}
    </div>
  );
};

export default HeaderSection;
