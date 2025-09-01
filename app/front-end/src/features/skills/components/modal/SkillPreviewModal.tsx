import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SkillPreviewModalProps } from '../../types/skills';
import styles from './SkillPreviewModal.module.css';

const SkillPreviewModal: React.FC<SkillPreviewModalProps> = ({
  isOpen,
  skill,
  skillsIcons,
  externalData,
  loadingExternalData,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !skill) return null;

  // Buscar el icono correspondiente
  const skillIcon = skillsIcons.find(icon => icon.name.toLowerCase() === skill.name.toLowerCase());

  // Obtener datos externos si están disponibles
  const external = externalData[skill.name] || {};
  const isLoadingExternal = loadingExternalData[skill.name] || false;

  // Mapear niveles a descripciones
  const getLevelDescription = (level: number): string => {
    if (level >= 90) return 'Experto';
    if (level >= 70) return 'Avanzado';
    if (level >= 50) return 'Intermedio';
    if (level >= 30) return 'Principiante+';
    return 'Principiante';
  };

  // Mapear popularidad a descripciones
  const getPopularityDescription = (popularity: string): string => {
    const popularityMap: Record<string, string> = {
      very_high: 'Muy Popular',
      high: 'Popular',
      medium: 'Moderadamente Popular',
      medium_low: 'Poco Popular',
      low: 'Nicho',
    };
    return popularityMap[popularity] || 'Desconocido';
  };

  // Mapear dificultad a descripciones
  const getDifficultyDescription = (difficulty: string): string => {
    const difficultyMap: Record<string, string> = {
      beginner: 'Fácil de Aprender',
      intermediate: 'Dificultad Moderada',
      advanced: 'Difícil de Dominar',
    };
    return difficultyMap[difficulty] || 'Dificultad Variable';
  };

  const modalContent = (
    <div
      className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`${styles.modalContent} ${isClosing ? styles.closing : ''}`}>
        <div className={styles.modalHeader}>
          <div className={styles.skillInfo}>
            {skillIcon && (
              <div className={styles.skillIconContainer}>
                <img
                  src={skillIcon.svg_path}
                  alt={`Icono de ${skill.name}`}
                  className={styles.skillIcon}
                />
              </div>
            )}
            <div className={styles.skillDetails}>
              <h2 className={styles.skillName}>{skill.name}</h2>
              <div className={styles.skillMeta}>
                <span className={styles.category}>
                  <i className="fas fa-folder"></i>
                  {skill.category}
                </span>
                {skill.featured && (
                  <span className={styles.featured}>
                    <i className="fas fa-star"></i>
                    Destacado
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Cerrar modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Nivel de Dominio */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-chart-line"></i>
              Nivel de Dominio
            </h3>
            <div className={styles.levelContainer}>
              <div className={styles.levelBar}>
                <div
                  className={styles.levelProgress}
                  style={{ width: `${skill.level || 0}%` }}
                ></div>
              </div>
              <div className={styles.levelText}>
                <span className={styles.levelPercentage}>{skill.level || 0}%</span>
                <span className={styles.levelDescription}>
                  {getLevelDescription(skill.level || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Información Externa */}
          {(external.popularity ||
            external.difficulty ||
            external.description ||
            isLoadingExternal) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <i className="fas fa-info-circle"></i>
                Información de la Tecnología
              </h3>

              {isLoadingExternal ? (
                <div className={styles.loadingExternal}>
                  <div className={styles.spinner}></div>
                  <span>Cargando información adicional...</span>
                </div>
              ) : (
                <div className={styles.externalData}>
                  {external.popularity && (
                    <div className={styles.dataItem}>
                      <span className={styles.dataLabel}>
                        <i className="fas fa-users"></i>
                        Popularidad:
                      </span>
                      <span className={styles.dataValue}>
                        {getPopularityDescription(external.popularity)}
                      </span>
                    </div>
                  )}

                  {external.difficulty && (
                    <div className={styles.dataItem}>
                      <span className={styles.dataLabel}>
                        <i className="fas fa-brain"></i>
                        Dificultad:
                      </span>
                      <span className={styles.dataValue}>
                        {getDifficultyDescription(external.difficulty)}
                      </span>
                    </div>
                  )}

                  {external.description && (
                    <div className={styles.dataItem}>
                      <span className={styles.dataLabel}>
                        <i className="fas fa-file-text"></i>
                        Descripción:
                      </span>
                      <span className={styles.dataValue}>{external.description}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Enlaces útiles */}
          {external.links && external.links.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <i className="fas fa-external-link-alt"></i>
                Enlaces Útiles
              </h3>
              <div className={styles.links}>
                {external.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    <i className="fas fa-link"></i>
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Información adicional del icono */}
          {skillIcon && (skillIcon.docs_url || skillIcon.official_repo) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <i className="fas fa-book"></i>
                Recursos Oficiales
              </h3>
              <div className={styles.links}>
                {skillIcon.docs_url && (
                  <a
                    href={skillIcon.docs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    <i className="fas fa-book-open"></i>
                    Documentación
                  </a>
                )}
                {skillIcon.official_repo && (
                  <a
                    href={skillIcon.official_repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    <i className="fab fa-github"></i>
                    Repositorio
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button type="button" onClick={handleClose} className={styles.closeButtonBottom}>
            <i className="fas fa-times"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SkillPreviewModal;
