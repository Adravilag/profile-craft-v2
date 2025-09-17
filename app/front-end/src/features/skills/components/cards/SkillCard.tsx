// src/features/skills/components/cards/SkillCard.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { SkillCardProps } from '../../types/skills';
import {
  getSkillSvg,
  getSkillCssClass,
  getDifficultyStars,
  testSvgAvailability,
} from '../../utils/skillUtils';
// Import lazy icon loader to resolve actual module URLs for SVGs in /src/assets/svg
import { findSkillIcon, getSkillIconEntry } from '@/features/skills/utils/iconLoader';
import { getIconUrl, resolveIconCandidates } from '@/features/skills/utils/iconResolve';
import { normalizeSvgPath } from '@/features/skills/utils/skillUtils';
import styles from './SkillsCard.module.css';
import useDropdown from '../../hooks/useDropdown';
import SkillMenu from './SkillMenu/SkillMenu';
import PortalDropdown from './PortalDropdown';
import SkillCommentModal from '../../components/modal/SkillCommentModal';
import { updateSkill as updateSkillEndpoint } from '@/services/endpoints/skills';
import { debugLog } from '@/utils/debugConfig';
import BlurImage from '@/components/utils/BlurImage';
// Use the shared canonical generic icon URL (avoids static ?url import)
import { GENERIC_ICON_URL } from '../../utils/skillUtils';
import { CommentTooltip } from '@/components/ui/CommentTooltip/CommentTooltip';

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
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const {
    menuRef,
    buttonRef,
    isMenuOpen,
    handleMenuEnter,
    handleMenuLeave,
    handleMenuClick,
    setIsMenuOpen,
  } = useDropdown();

  // Ref para toda la card: usaremos esto como anchor para el PortalDropdown que
  // mostrará el comentario cuando el usuario haga click sobre la card (no en botones)
  const cardRef = React.useRef<HTMLElement | null>(null);
  const [isCommentPreviewOpen, setIsCommentPreviewOpen] = React.useState(false);
  const [mouseY, setMouseY] = React.useState<number | null>(null);
  const [isPortalPresent, setIsPortalPresent] = React.useState(false);

  // Detectar si el portal está presente en el DOM (útil para tests que mockean PortalDropdown)
  useEffect(() => {
    const check = () => {
      const portal = document.querySelector('.pc-skill-portal, [data-testid="portal"]');
      setIsPortalPresent(Boolean(portal));
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  // Handler para click en la card: si la skill tiene comentario, abrir portal.
  const handleCardClick = (ev: React.MouseEvent) => {
    // Si el click proviene de un control interactivo (botones, enlaces, inputs), no abrir
    const target = ev.target as HTMLElement | null;
    if (!target) return;

    // Elements that should not trigger the preview (menu button, links, inputs)
    const interactiveSelectors = ['button', 'a', 'input', 'textarea', 'select', '[role="button"]'];
    // climb up to 4 levels to check
    let el: HTMLElement | null = target;
    for (let i = 0; i < 6 && el; i++) {
      if (el.matches && interactiveSelectors.some(s => el!.matches(s))) return;
      el = el.parentElement;
    }

    // Only open preview if skill has a non-empty comment
    const rawComment = (skill as any).comment;
    // Normalize legacy string -> en, otherwise prefer en then es
    const commentHtml =
      typeof rawComment === 'string'
        ? rawComment
        : rawComment && (rawComment.en || rawComment.es)
          ? rawComment.en || rawComment.es
          : '';
    if (commentHtml && String(commentHtml).trim() !== '') {
      setIsCommentPreviewOpen(prev => !prev);
    }
  };

  // Memoizar el SVG y el color para evitar recálculos innecesarios
  const { svgPath, skillColor, difficultyStars } = useMemo(() => {
    // Buscar información adicional del CSV
    const skillInfo = skillsIcons.find(
      (s: any) => s.name.toLowerCase() === skill.name.toLowerCase()
    );

    // Determinar SVG usando la función utilitaria
    // Prefer `svg_path` or explicit `svg` on the skill if present (new approach).
    // Fall back to existing CSV mapping or getSkillSvg helper. We avoid calling
    // the global eager icon loader here to prevent bundling all SVGs.
    const path = getSkillSvg(skill.name, (skill as any).svg_path, skillsIcons);

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
  }, [skill.name, (skill as any).svg_path, skillsIcons]);

  // Resolver rutas de icono: respetar URLs absolutas (http(s)://, //, data:, blob:)
  const resolveIconUrl = useCallback((path?: string | null) => {
    if (!path) return GENERIC_ICON_URL;
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

  const [iconSrc, setIconSrc] = useState(() => resolveIconUrl(svgPath));
  // Keep a ref of the current iconSrc so effects can compare without forcing
  // themselves to depend on `iconSrc` (which would cause re-runs when we set it).
  const iconSrcRef = React.useRef<string>(iconSrc);
  React.useEffect(() => {
    iconSrcRef.current = iconSrc;
  }, [iconSrc]);

  // Track which candidates we've already attempted for the current svgPath to
  // avoid repeated resolution attempts that could flip iconSrc back and forth.
  const triedCandidatesRef = React.useRef<Set<string>>(new Set());
  const lastSvgPathRef = React.useRef<string | null>(null);

  // Stable derived values for effect dependencies (avoid passing whole `skill`)
  const skillSlug = (skill as any)?.slug ? String((skill as any).slug) : '';
  const skillName = skill.name;

  // Re-evaluar el icono si svgPath cambia
  useEffect(() => {
    const resolved = resolveIconUrl(svgPath);
    setIconSrc(resolved || GENERIC_ICON_URL);
  }, [svgPath, resolveIconUrl]);

  // If svgPath is a canonical local asset (/assets/svg/<file>.svg), try to
  // resolve the real hashed URL via the lazy icon loader. This ensures we
  // don't rely on the canonical path which may 404 in production builds.
  useEffect(() => {
    let mounted = true;
    const tryResolveHashed = async () => {
      try {
        if (!svgPath) return;
        // only attempt for local asset-like paths
        if (!svgPath.includes('.svg')) return;
        // derive filename without extension
        const file = svgPath.split('/').pop() || svgPath;
        const base = file.replace(/\.svg$/i, '').replace(/^\//, '');
        if (!base) return;
        // If svgPath changed, reset tried candidates set
        if (lastSvgPathRef.current !== svgPath) {
          triedCandidatesRef.current.clear();
          lastSvgPathRef.current = svgPath || null;
        }

        // First try direct base
        if (import.meta.env.MODE === 'development') {
          // eslint-disable-next-line no-console
          console.debug('[SkillCard] trying hashed resolution for', {
            base,
            candidates: [base, (skill as any).slug, skill.name],
          });
        }
        let url = await getIconUrl(base);
        if (!mounted) return;
        if (url && url !== iconSrcRef.current && !triedCandidatesRef.current.has(url)) {
          if (import.meta.env.MODE === 'development') {
            // eslint-disable-next-line no-console
            console.debug('[SkillCard] getIconUrl direct hit', { base, url });
          }
          setIconSrc(url);
          triedCandidatesRef.current.add(url);
          return;
        }

        // If not found, try more aggressive candidate resolution
        const candidates = [base, (skill as any).slug || '', skill.name || ''].filter(Boolean);
        if (import.meta.env.MODE === 'development') {
          // eslint-disable-next-line no-console
          console.debug('[SkillCard] resolveIconCandidates with', { candidates });
        }
        url = await resolveIconCandidates(candidates as string[]);
        if (!mounted) return;
        if (url && url !== iconSrcRef.current && !triedCandidatesRef.current.has(url)) {
          if (import.meta.env.MODE === 'development') {
            // eslint-disable-next-line no-console
            console.debug('[SkillCard] resolveIconCandidates hit', { candidates, url });
          }
          setIconSrc(url);
          triedCandidatesRef.current.add(url);
        }
      } catch (e) {
        // ignore
      }
    };

    void tryResolveHashed();

    return () => {
      mounted = false;
    };
    // depend on identifying info only; do NOT include `iconSrc` which would
    // re-trigger when we update it and can cause loops
  }, [svgPath, skillSlug, skillName]);

  // Lazy-load assets from `src/assets/svg` using import.meta.glob only when the
  // component is mounted. Prefer the centralized icon map (findSkillIcon) first
  // — this reduces reliance on filename-based resolution and uses the slug as
  // canonical lookup key. Keep import.meta.glob as a last-resort fallback.
  useEffect(() => {
    let mounted = true;

    const tryResolve = async () => {
      try {
        // 1) Prefer centralized map via findSkillIcon (slug-first)
        try {
          const lookupKeys = [] as string[];
          if ((skill as any).slug) lookupKeys.push((skill as any).slug.toString());
          if (skill.name) lookupKeys.push(skill.name.toString());
          // normalize keys to lower-case dashed form used by the map
          const normalizeKey = (s: string) =>
            s
              .toString()
              .trim()
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-.]/g, '');

          for (const k of lookupKeys) {
            const normalized = normalizeKey(k);
            const candidate = findSkillIcon(normalized);
            if (candidate && typeof candidate === 'string') {
              if (!mounted) return;
              if (candidate !== iconSrcRef.current && !triedCandidatesRef.current.has(candidate)) {
                setIconSrc(candidate);
                triedCandidatesRef.current.add(candidate);
              }
              return;
            }
            // If the map returned an object with svg_path or svg, prefer svg_path
            if (candidate && typeof candidate === 'object') {
              const path = (candidate as any).svg_path || (candidate as any).svg;
              if (path) {
                if (!mounted) return;
                if (path !== iconSrcRef.current && !triedCandidatesRef.current.has(path)) {
                  setIconSrc(path);
                  triedCandidatesRef.current.add(path);
                }
                return;
              }
            }
          }
        } catch (e) {
          // swallow and continue to fallback resolution
        }

        // 2) Last-resort: ask the centralized resolver for candidate names
        try {
          const candidates: string[] = [];
          const explicit = ((skill as any).svg_path || (skill as any).svg || '').toString().trim();
          if (explicit) {
            const base = explicit.replace(/^\/+/, '').replace(/.*\//, '');
            candidates.push(base.replace(/\.svg$/i, ''));
          }
          if ((skill as any).slug) candidates.push((skill as any).slug.toString());
          if (skill.name) candidates.push(skill.name.toString());

          const url = await resolveIconCandidates(candidates as string[]);
          if (!mounted) return;
          if (url && url !== iconSrcRef.current && !triedCandidatesRef.current.has(url)) {
            setIconSrc(url);
            triedCandidatesRef.current.add(url);
          }
        } catch (e) {
          // ignore non-fatal
        }
      } catch (err) {
        // Non-fatal; keep generic fallback
      }
    };

    void tryResolve();

    return () => {
      mounted = false;
    };
    // depend on stable identifiers only; avoid `iconSrc` here for the same reason
  }, [skillSlug, skillName, svgPath]);

  // Cerrar el preview de comentario al hacer click fuera de la card o al presionar Escape
  useEffect(() => {
    if (!isCommentPreviewOpen) return undefined;

    const onDocumentClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;

      // Si el click ocurre dentro del card, no cerrar
      if (cardRef.current && cardRef.current.contains(target)) return;

      // Si el click ocurre dentro del menú o el botón del menú, no cerrar
      if (menuRef.current && menuRef.current.contains(target)) return;
      if (
        buttonRef &&
        'current' in buttonRef &&
        buttonRef.current &&
        buttonRef.current.contains(target)
      )
        return;

      setIsCommentPreviewOpen(false);
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        setIsCommentPreviewOpen(false);
      }
    };

    document.addEventListener('click', onDocumentClick, true);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('click', onDocumentClick, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isCommentPreviewOpen, menuRef, buttonRef]);

  // Cerrar el preview de comentario cuando el usuario haga scroll en la página
  useEffect(() => {
    if (!isCommentPreviewOpen) return undefined;

    const onScroll = () => {
      setIsCommentPreviewOpen(false);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [isCommentPreviewOpen]);

  // Manejador de errores para la imagen
  const handleImageError = useCallback(
    (event?: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const imgSrc =
        event?.currentTarget?.src || (event && (event.target as HTMLImageElement).src) || iconSrc;

      // Diferir la comprobación breve para cubrir el caso de lazy-loading/placeholder
      // Cuando la imagen aún puede estar en proceso de carga nativa, un error inmediato
      // puede ser un falso positivo. Esperamos y hacemos un HEAD/GET para validar.
      const validateAndFallback = async () => {
        try {
          // Espera breve para permitir que los loaders nativos continúen
          await new Promise(res => setTimeout(res, 150));

          // Intentar HEAD primero (menos intrusivo). Si falla por CORS, intentar GET.
          let ok = false;
          try {
            const headRes = await fetch(imgSrc, { method: 'HEAD', cache: 'no-store' });
            ok = headRes && headRes.ok;
          } catch (headErr) {
            // HEAD puede fallar por CORS en algunos servidores; intentar GET ligero
            try {
              const getRes = await fetch(imgSrc, { method: 'GET', cache: 'no-store' });
              ok = getRes && getRes.ok;
            } catch (getErr) {
              ok = false;
            }
          }

          if (ok) {
            // El recurso existe; dejar que el navegador reintente o que el desarrollador
            // inspeccione. No loguear un warning falso.
            debugLog.dataLoading(`Icon appears available after check for ${skill.name}:`, imgSrc);
            return;
          }

          // Si no está disponible, proceder con fallback y log detallado
          debugLog.warn(`❌ Error al cargar icono para ${skill.name}. Usando fallback.`, {
            originalPath: svgPath,
            resolved: iconSrc,
            imgSrc,
          });
          // eslint-disable-next-line no-console
          console.warn('Icon load failed', {
            name: skill.name,
            svgPath,
            resolved: iconSrc,
            imgSrc,
          });

          // Intentar cargar de forma lazy un SVG público que coincida con la skill
          try {
            const candidates: string[] = [];
            const explicit = ((skill as any).svg_path || (skill as any).svg || '')
              .toString()
              .trim();
            if (explicit) {
              const base = explicit.replace(/^\/+/, '').replace(/.*\//, '');
              candidates.push(base.replace(/\.svg$/i, ''));
            }
            if ((skill as any).slug) candidates.push((skill as any).slug.toString());
            if (skill.name) candidates.push(skill.name.toString());

            const normalize = (s: string) =>
              s
                .toString()
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-.]/g, '');

            const normalized = candidates.map(c => normalize(c));

            // Intentar fetch HEAD/GET a ruta pública basada en el manifest (prefiere svg_path)
            for (const n of normalized) {
              // If the manifest entry exists for this normalized key, prefer its svg_path
              let publicPath = undefined;
              try {
                const entry = getSkillIconEntry(n);
                if (entry && (entry as any).svg_path)
                  publicPath = normalizeSvgPath((entry as any).svg_path);
                else if (entry && entry.svg) publicPath = normalizeSvgPath(entry.svg);
              } catch (e) {
                // ignore
              }
              if (!publicPath) publicPath = resolveIconUrl(`/assets/svg/${n}.svg`);
              try {
                const res = await fetch(publicPath, { method: 'HEAD', cache: 'no-store' });
                if (res && res.ok) {
                  if (
                    publicPath !== iconSrcRef.current &&
                    !triedCandidatesRef.current.has(publicPath)
                  ) {
                    setIconSrc(publicPath);
                    triedCandidatesRef.current.add(publicPath);
                    return;
                  }
                }
              } catch (headErr) {
                try {
                  const getRes = await fetch(publicPath, { method: 'GET', cache: 'no-store' });
                  if (getRes && getRes.ok) {
                    if (
                      publicPath !== iconSrcRef.current &&
                      !triedCandidatesRef.current.has(publicPath)
                    ) {
                      setIconSrc(publicPath);
                      triedCandidatesRef.current.add(publicPath);
                      return;
                    }
                  }
                } catch (getErr) {
                  // ignore and continue
                }
              }
            }
          } catch (e) {
            // ignore non-fatal
          }

          // Si ya estamos mostrando el fallback, no hacer nada más
          if (iconSrc === GENERIC_ICON_URL) return;
          setIconSrc(GENERIC_ICON_URL);
        } catch (error) {
          // En caso de error en la validación, caer al fallback para no romper UI
          debugLog.warn(`❌ Error validating icon for ${skill.name}, applying fallback.`, {
            error,
          });
          if (iconSrc !== GENERIC_ICON_URL) setIconSrc(GENERIC_ICON_URL);
        }
      };

      void validateAndFallback();
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
    <>
      <article
        className={`${styles.skillCard} ${skillCssClass}${
          isDragging ? ` ${styles.dragging}` : ''
        } ${skill.featured ? styles.featuredCard : ''} ${isCommentPreviewOpen ? styles.previewOpen : ''}`}
        ref={cardRef}
        onClick={handleCardClick}
        onMouseEnter={() => {
          // Abrir preview al hacer hover si existe comentario
          const rawComment = (skill as any).comment;
          const commentHtml =
            typeof rawComment === 'string'
              ? rawComment
              : rawComment && (rawComment.en || rawComment.es)
                ? rawComment.en || rawComment.es
                : '';
          if (commentHtml && String(commentHtml).trim() !== '') {
            setIsCommentPreviewOpen(true);
          }
        }}
        onMouseMove={ev => setMouseY(ev.clientY)}
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
            <span
              className={styles.featuredIcon}
              title="Destacado"
              aria-label="Habilidad destacada"
            >
              <i className="fas fa-star"></i>
            </span>
          )}

          {/* Menú de tres puntos - solo visible para administradores */}
          {isAdmin && (
            <div className={styles.skillActions}>
              <div className={styles.dropdown} ref={menuRef} data-menu-open={isMenuOpen}>
                <button
                  type="button"
                  ref={buttonRef}
                  className={`${styles.menuBtn} ${isMenuOpen ? styles.menuBtnActive : ''}`}
                  aria-label="Opciones"
                  onClick={handleMenuClick}
                >
                  <i className="fas fa-ellipsis-v"></i>
                </button>
                {
                  <PortalDropdown
                    anchorRef={buttonRef}
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                  >
                    <SkillMenu
                      skill={skill}
                      isOpen={isMenuOpen}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onOpenComment={() => setIsCommentOpen(true)}
                      closeMenu={() => setIsMenuOpen(false)}
                    />
                  </PortalDropdown>
                }
              </div>
            </div>
          )}
        </header>

        {/* Portal preview for comment (opens when clicking on the card body) */}
        <PortalDropdown
          anchorRef={cardRef}
          isOpen={isCommentPreviewOpen}
          onClose={() => setIsCommentPreviewOpen(false)}
          mouseY={mouseY}
        >
          {/* añadir aqui el contenido del comentario */}
          <CommentTooltip
            loading={savingComment}
            comment={
              typeof (skill as any).comment === 'string'
                ? (skill as any).comment
                : (skill.comment ?? null)
            }
            title={`Comentario de ${skill.name}`}
            visible={isCommentPreviewOpen}
            onClose={() => setIsCommentPreviewOpen(false)}
            allowHtml={true}
          />
        </PortalDropdown>

        {/* Cuerpo principal */}
        <div className={styles.skillCardContent}>
          {/* Sección de nivel */}
          {typeof skill.level === 'number' && (
            <div className={`${styles.skillLevel} ${styles.levelSection}`}>
              <div className={styles.levelHeader}>
                <span className={styles.levelLabel}>
                  Nivel
                  <span
                    className={styles.tooltipHint}
                    style={
                      isCommentPreviewOpen || isPortalPresent ? { display: 'none' } : undefined
                    }
                  >
                    Porcentaje de dominio
                  </span>
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
                <span
                  className={styles.tooltipHint}
                  style={isCommentPreviewOpen || isPortalPresent ? { display: 'none' } : undefined}
                >
                  Percepción de complejidad
                </span>
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
      {/* Modal para comentario */}
      <SkillCommentModal
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        skillId={skill.id}
        initialComment={
          typeof (skill as any).comment === 'string'
            ? { en: (skill as any).comment }
            : (skill.comment ?? null)
        }
        onSave={async comment => {
          try {
            setSavingComment(true);
            // Llamar al endpoint de actualización con el campo comment
            // No forzamos Number(skill.id) porque en MongoDB los ids son strings (ObjectId)
            await updateSkillEndpoint(skill.id as any, { comment });
            // Si hay un manejador de edición en el padre, usarlo para actualizar el UI
            if (onEdit) onEdit({ ...skill, comment });
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Error updating skill comment', err);
          } finally {
            setSavingComment(false);
          }
        }}
      />
    </>
  );
};

export default React.memo(SkillCard);
