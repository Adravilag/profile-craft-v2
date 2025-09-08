// src/features/skills/components/cards/SkillCard.tsx

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { SkillCardProps } from '../../types/skills';
import {
  getSkillSvg,
  getSkillCssClass,
  getDifficultyStars,
  testSvgAvailability,
} from '../../utils/skillUtils';
import styles from '../../styles/SkillsCard.module.css';
import { debugLog } from '@/utils/debugConfig';
import BlurImage from '@/components/utils/BlurImage';
// Fallback estable empaquetado por Vite
import genericIconUrl from '@/assets/svg/generic-code.svg?url';
import { findSkillIcon } from '@/features/skills/utils/iconLoader';
import { normalizeSkillName } from '@/features/skills/utils/normalizeSkillName';

// --- Custom Hook para el menú contextual ---
const useDropdown = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuTimeoutId, setMenuTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuEnter = useCallback(() => {
    if (menuTimeoutId) {
      clearTimeout(menuTimeoutId);
      setMenuTimeoutId(null);
    }
    setIsMenuOpen(true);
  }, [menuTimeoutId]);

  const handleMenuLeave = useCallback(() => {
    const timeoutId = setTimeout(() => setIsMenuOpen(false), 300);
    setMenuTimeoutId(timeoutId);
  }, []);

  const handleMenuClick = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      if (menuTimeoutId) {
        clearTimeout(menuTimeoutId);
      }
    };
  }, [menuTimeoutId]);

  return { menuRef, isMenuOpen, handleMenuEnter, handleMenuLeave, handleMenuClick, setIsMenuOpen };
};

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  skillsIcons,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isAdmin = false,
}) => {
  const { menuRef, isMenuOpen, handleMenuEnter, handleMenuLeave, handleMenuClick, setIsMenuOpen } =
    useDropdown();

  // Memoizar el SVG y el color para evitar recálculos innecesarios
  const { svgPath, skillColor, difficultyStars } = useMemo(() => {
    // Buscar información adicional del CSV
    const skillInfo = skillsIcons.find(
      (s: any) => s.name.toLowerCase() === skill.name.toLowerCase()
    );

    // Determinar SVG usando la función utilitaria
    const path = getSkillSvg(skill.name, skill.icon_class, skillsIcons);

    // Determinar color desde CSV o mapa de marca
    const brandColorMap: Record<string, string> = {
      html5: '#E34F26',
      css3: '#1572B6',
      javascript: '#F7DF1E',
      js: '#F7DF1E',
      react: '#61DAFB',
      typescript: '#3178C6',
      'vue.js': '#4FC08D',
      vue: '#4FC08D',
      'next.js': '#FFFFFF',
      nextjs: '#FFFFFF',
      redux: '#764ABC',
      sass: '#CF649A',
      'tailwind css': '#06B6D4',
      bootstrap: '#7B14FF',
      wordpress: '#21759B',
      angular: '#DD0031',
    };
    const normalizedName = skill.name.toLowerCase().trim();
    const color = skillInfo?.color || brandColorMap[normalizedName] || '#3b82f6';

    // Determinar nivel de dificultad para mostrar estrellas
    const difficultySource = skillInfo?.difficulty_level ?? 'intermediate';
    const stars = getDifficultyStars(difficultySource);

    return { svgPath: path, skillColor: color, difficultyStars: stars };
  }, [skill.name, skill.icon_class, skillsIcons]);

  // Resolver rutas de icono: respetar URLs absolutas (http(s)://, //, data:, blob:)
  const resolveIconUrl = useCallback((path?: string | null) => {
    if (!path) return genericIconUrl;
    const trimmed = path.trim();
    // Si comienza por '/' lo consideramos ruta desde la raíz del sitio.
    // Si la app tiene un BASE_URL distinto de '/', prefijarla para respetar el basename
    if (trimmed.startsWith('/')) {
      try {
        const base = (import.meta.env.BASE_URL as string) || '/';
        const normalizedBase = base.endsWith('/') ? base : `${base}/`;
        if (normalizedBase === '/') return trimmed;
        const baseNoSlash = normalizedBase.replace(/\/$/, '');
        return `${baseNoSlash}${trimmed}`;
      } catch (e) {
        return trimmed;
      }
    }
    // Si ya es absoluta o data/blob, devolver tal cual
    if (/^(https?:\/\/|data:|blob:|\/\/)/i.test(trimmed)) return trimmed;
    try {
      const base = (import.meta.env.BASE_URL as string) || '/';
      const normalizedBase = base.endsWith('/') ? base : `${base}/`;
      const relative = trimmed.replace(/^\/+/, '');
      return `${normalizedBase}${relative}`;
    } catch (e) {
      return trimmed;
    }
  }, []);

  // Estado para el icono de la habilidad (maneja fallbacks)
  const [iconSrc, setIconSrc] = useState(() => resolveIconUrl(svgPath));

  // Re-evaluar el icono si svgPath cambia
  useEffect(() => {
    (async () => {
      const resolved = resolveIconUrl(svgPath);

      // Si la resolución devolvió el fallback genérico, intentar resolver usando el cargador central (findSkillIcon)
      if (!resolved || resolved === genericIconUrl) {
        try {
          const { canonical, normalized } = normalizeSkillName(skill.name);
          const loaderUrl = findSkillIcon(canonical, normalized);
          if (loaderUrl) {
            setIconSrc(loaderUrl);
            return;
          }
        } catch (e) {
          // ignore and fall back below
        }
        setIconSrc(genericIconUrl);
        return;
      }

      setIconSrc(resolved);
    })();
  }, [svgPath, resolveIconUrl]);

  // Manejador de errores para la imagen
  const handleImageError = useCallback(
    (event?: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const imgSrc =
        event?.currentTarget?.src || (event && (event.target as HTMLImageElement).src) || iconSrc;
      // Log detallado para depuración: skill, origen y URL resuelta
      debugLog.warn(`❌ Error al cargar icono para ${skill.name}. Usando fallback.`, {
        originalPath: svgPath,
        resolved: iconSrc,
        imgSrc,
      });
      // También imprimir en consola para facilitar captura desde DevTools
      // eslint-disable-next-line no-console
      console.warn('Icon load failed', { name: skill.name, svgPath, resolved: iconSrc, imgSrc });

      // Intentar resolver mediante el cargador de icons empaquetados antes de usar el fallback genérico
      try {
        const { canonical, normalized } = normalizeSkillName(skill.name);
        const loaderUrl = findSkillIcon(canonical, normalized);
        if (loaderUrl && loaderUrl !== iconSrc) {
          setIconSrc(loaderUrl);
          return;
        }
      } catch (e) {
        // ignore
      }

      // Si ya estamos mostrando el fallback, no hacer nada más
      if (iconSrc === genericIconUrl) return;
      setIconSrc(genericIconUrl);
    },
    [iconSrc, skill.name, svgPath]
  );

  // Obtener clase CSS específica para esta tecnología
  const skillCssClass = useMemo(() => getSkillCssClass(skill.name), [skill.name]);

  // Convertir número de estrellas a texto de dificultad
  const getDifficultyText = (stars: number): string => {
    // Debug temporal
    switch (stars) {
      case 1:
        return 'básico';
      case 2:
        return 'fácil';
      case 3:
        return 'medio';
      case 4:
        return 'difícil';
      case 5:
        return 'experto';
      default:
        return 'medio';
    }
  };

  return (
    <article
      className={`${styles.skillCard} ${skillCssClass}${
        isDragging ? ` ${styles.dragging}` : ''
      } ${skill.featured ? styles.featuredCard : ''}`}
      draggable
      onDragStart={() => onDragStart(skill.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(skill.id)}
      style={
        {
          '--skill-color': skillColor,
        } as React.CSSProperties
      }
      data-skill={skill.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
    >
      {/* Header con icono, nombre y menú */}
      <header className={styles.skillCardHeader}>
        <div className={styles.skillIconWrapper}>
          <BlurImage
            src={iconSrc}
            alt={`Icono de ${skill.name}`}
            className={styles.skillIcon}
            onError={handleImageError}
            loading="eager"
          />
        </div>

        <h3 className={styles.skillName}>{skill.name}</h3>
        {skill.featured && (
          <span className={styles.featuredIcon} title="Destacado" aria-label="Habilidad destacada">
            <i className="fas fa-star"></i>
          </span>
        )}

        {/* Menú de tres puntos - solo visible para administradores */}
        {isAdmin && (
          <div className={styles.skillActions}>
            <div
              className={styles.dropdown}
              ref={menuRef}
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
              data-menu-open={isMenuOpen}
            >
              <button
                type="button"
                className={`${styles.menuBtn} ${isMenuOpen ? styles.menuBtnActive : ''}`}
                aria-label="Opciones"
                onClick={handleMenuClick}
              >
                <i className="fas fa-ellipsis-v"></i>
              </button>
              <div
                className={`${styles.dropdownContent} ${isMenuOpen ? styles.dropdownContentOpen : ''}`}
              >
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    onEdit(skill);
                    setIsMenuOpen(false);
                  }}
                >
                  <i className="fas fa-edit"></i>
                  Editar
                </button>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${styles.delete}`}
                  onClick={() => {
                    onDelete(skill.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <i className="fas fa-trash"></i>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Cuerpo principal */}
      <div className={styles.skillCardContent}>
        {/* Sección de nivel */}
        {typeof skill.level === 'number' && (
          <div className={`${styles.skillLevel} ${styles.levelSection}`}>
            <div className={styles.levelHeader}>
              <span className={styles.levelLabel}>
                Nivel
                <span className={styles.tooltipHint}>Porcentaje de dominio</span>
              </span>
              <span className={styles.levelValue} aria-live="polite">
                {skill.level}%
              </span>
            </div>
            <div
              className={styles.levelBar}
              role="progressbar"
              aria-valuenow={skill.level}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Nivel de dominio: ${skill.level}%`}
            >
              <div className={styles.levelProgress} style={{ width: `${skill.level}%` }} />
            </div>
          </div>
        )}

        {/* Sección de dificultad */}
        {difficultyStars > 0 && (
          <div
            className={`${styles.skillDifficulty} ${styles.difficultySection}`}
            style={
              {
                '--difficulty-text': `"${getDifficultyText(difficultyStars)}"`,
              } as React.CSSProperties
            }
          >
            <span className={styles.difficultyLabel}>
              Dificultad
              <span className={styles.tooltipHint}>Percepción de complejidad</span>
            </span>
            <div
              className={styles.difficultyStars}
              role="img"
              aria-label={`Dificultad: ${difficultyStars} de 5 estrellas`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <i
                  key={i}
                  className={`${styles.star} ${i < difficultyStars ? styles.filled : styles.empty} ${i < difficultyStars ? 'fas fa-star' : 'far fa-star'}`}
                  aria-hidden="true"
                ></i>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default React.memo(SkillCard);
