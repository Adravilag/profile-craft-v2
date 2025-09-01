import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import styles from './HighlightCard.module.css';

type Props = {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  descriptionHtml?: string; // sanitized HTML/Markdown string
  tech?: string;
  imageSrc?: string;
};

const HighlightCard: React.FC<Props> = ({
  icon,
  title,
  description,
  descriptionHtml,
  tech,
  imageSrc,
}) => {
  return (
    <div className={styles.card} role="project">
      {/* background blurred image layer */}
      {imageSrc ? (
        <div className={styles.bg} style={{ backgroundImage: `url(${imageSrc})` }} aria-hidden />
      ) : null}
      <div className={styles.bgOverlay} aria-hidden />
      <div className={styles.icon} aria-hidden>
        {icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {/* Prefer sanitized HTML/Markdown if provided */}
      {descriptionHtml ? (
        <div className={styles.desc}>
          {/* rehype-sanitize typing can conflict between package versions; cast to any to avoid TS errors */}
          <ReactMarkdown rehypePlugins={[rehypeSanitize as any]}>{descriptionHtml}</ReactMarkdown>
        </div>
      ) : (
        <div className={styles.desc}>{description}</div>
      )}
      {tech ? <div className={styles.tech}>{tech}</div> : null}
      <div className={styles.accent} aria-hidden></div>
    </div>
  );
};

export default HighlightCard;
