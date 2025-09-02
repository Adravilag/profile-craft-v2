// [IMPLEMENTACION]
import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardSubComponentProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardSubComponentProps>;
  Media: React.FC<CardSubComponentProps>;
  Body: React.FC<CardSubComponentProps>;
  Footer: React.FC<CardSubComponentProps>;
  Tags: React.FC<CardSubComponentProps>;
} = ({ children, className = '' }) => {
  return <div className={`${styles.card} ${className}`.trim()}>{children}</div>;
};

// Subcomponentes
Card.Header = ({ children, className = '' }) => (
  <div className={`${styles.cardHeader} ${className}`.trim()}>{children}</div>
);

Card.Media = ({ children, className = '' }) => (
  <div className={`${styles.cardMedia} ${className}`.trim()}>{children}</div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`${styles.cardBody} ${className}`.trim()}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`${styles.cardFooter} ${className}`.trim()}>{children}</div>
);

Card.Tags = ({ children, className = '' }) => (
  <div className={`${styles.cardTags} ${className}`.trim()}>{children}</div>
);

export default Card;
