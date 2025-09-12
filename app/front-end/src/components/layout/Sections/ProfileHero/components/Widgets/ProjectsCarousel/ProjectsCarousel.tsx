import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './ProjectsCarousel.module.css';
import { projects as endpointsProjects } from '@/services/endpoints';
import type { Project } from '@/types/api';
import type { MappedProject } from '@/services/mappers/projects';
import { mapApiToUi } from '@/services/mappers/projects';
import SkillPill from '@/components/ui/SkillPill/SkillPill';
import { useTranslation } from '@/contexts/TranslationContext';

// Helper para generar una ID única
const generateUniqueId = () => `projects-carousel-${Math.random().toString(36).slice(2, 9)}`;

interface Props {
  projects?: Project[];
}

const ProjectsCarousel: React.FC<Props> = ({ projects: initialProjects }) => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<MappedProject[] | null>(
    initialProjects?.length ? initialProjects.map(mapApiToUi) : null
  );
  const [loading, setLoading] = useState(!initialProjects || !initialProjects.length);
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});
  const [inViewMap, setInViewMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const wrapperIdRef = useRef<string>(generateUniqueId());

  // Lógica de arrastre
  const isDragging = useRef(false);
  const dragStartPos = useRef<number | null>(null);
  const lastWheelTime = useRef<number>(0);

  const length = projects?.length ?? 0;

  // Funciones de navegación con memoización
  const prev = useCallback(() => setIndex(i => (i - 1 + length) % Math.max(1, length)), [length]);
  const next = useCallback(() => setIndex(i => (i + 1) % Math.max(1, length)), [length]);
  const goTo = useCallback((i: number) => setIndex(i), []);
  // Ref para controlar si el componente sigue montado
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Función reutilizable para obtener proyectos (usada en carga inicial y reintentos)
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await endpointsProjects.getProjects();
      if (!mountedRef.current) return;
      const mapped = (data || []).map(mapApiToUi);
      setProjects(mapped);
      setIndex(0);
    } catch (err) {
      if (!mountedRef.current) return;
      // No sobreescribimos la lista de proyectos existente en caso de error transitorio,
      // así el carrusel sigue mostrando contenido ya cargado.
      console.error('Error al obtener proyectos (ProjectsCarousel):', err);
      const msg =
        err && (err as any).message ? (err as any).message : t.projectsCarousel.errorLoading;
      setError(msg);
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
    }
  }, []);

  // Efecto de carga inicial
  useEffect(() => {
    // Si no vienen proyectos iniciales o viene un array vacío, realizar la carga desde el endpoint
    if (!initialProjects || (Array.isArray(initialProjects) && initialProjects.length === 0)) {
      fetchProjects();
    }
    // si vienen proyectos iniciales, ya están mapeados en el estado inicial
  }, [initialProjects, fetchProjects]);

  // Lógica de navegación con teclado
  useEffect(() => {
    if (!projects) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          prev();
          break;
        case 'ArrowRight':
          next();
          break;
        case 'Home':
          goTo(0);
          break;
        case 'End':
          goTo(projects.length - 1);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, goTo, projects]);

  // IntersectionObserver para lazy-loading y pre-fetch
  useEffect(() => {
    if (!wrapperRef.current || !projects?.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const id = el.dataset.projectId;
            if (id) {
              setInViewMap(s => ({ ...s, [id]: true }));
              observer.unobserve(el);
            }
          }
        });
      },
      { rootMargin: '400px' }
    );

    // Observar el elemento actual, anterior y siguiente para precarga
    const toObserve = new Set<string>();
    const cur = projects[index];
    if (cur) toObserve.add(cur.id);
    const n = projects[(index + 1) % projects.length];
    const p = projects[(index - 1 + projects.length) % projects.length];
    if (n) toObserve.add(n.id);
    if (p) toObserve.add(p.id);

    toObserve.forEach(id => {
      const el = wrapperRef.current!.querySelector(`[data-project-id="${id}"]`);
      if (el) observer.observe(el);
    });

    return () => {
      try {
        if (observer && typeof (observer as any).disconnect === 'function') {
          (observer as any).disconnect();
        }
      } catch {
        // ignore
      }
    };
  }, [projects, index]);

  // Lógica de arrastre
  const handleDrag = useCallback(
    (clientX: number) => {
      if (!isDragging.current || dragStartPos.current === null) return;
      const delta = clientX - dragStartPos.current;
      if (Math.abs(delta) < 40) return;
      if (delta > 0) prev();
      else next();
      // Resetear para evitar navegación múltiple
      isDragging.current = false;
      dragStartPos.current = null;
    },
    [prev, next]
  );

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartPos.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      handleDrag(e.changedTouches[0].clientX);
    },
    [handleDrag]
  );

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragStartPos.current = e.clientX;
    isDragging.current = true;
    e.preventDefault();
  }, []);

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging.current) {
        handleDrag(e.clientX);
      }
      isDragging.current = false;
      dragStartPos.current = null;
    },
    [handleDrag]
  );

  // Navegación con rueda de ratón (throttled)
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 220) return;
      if (Math.abs(e.deltaY) < 20) return;
      lastWheelTime.current = now;
      if (e.deltaY > 0) next();
      else prev();
    },
    [next, prev]
  );

  const markLoaded = useCallback((id: string) => setLoadedMap(s => ({ ...s, [id]: true })), []);

  const current = projects?.[index] ?? null;
  const statusHuman = current?.status
    ? String(current.status)
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    : '';
  const getStatusClass = (raw?: unknown) => {
    if (!raw) return styles.status;
    const kebab = String(raw)
      .toLowerCase()
      .replace(/[_\s]+/g, '-');
    return (styles as any)[`status--${kebab}`] || styles.status;
  };
  const chipList = current
    ? current.tags?.length
      ? current.tags
      : ((current as any).technologies ?? [])
    : [];

  const footerEl =
    typeof document !== 'undefined' ? document.getElementById('header-terminal-footer') : null;

  // Si no hay proyectos cargados y no estamos en loading ni en error, no renderizamos el carrusel
  const hasProjects = Array.isArray(projects) && projects.length > 0;
  if (!hasProjects && !loading && !error) return null;

  const dotsNode =
    projects && projects.length > 1 ? (
      <div
        className={styles.paginationDots}
        aria-hidden={projects.length <= 1}
        role="tablist"
        aria-label={t.projectsCarousel.pagination}
      >
        {projects.map((p, i) => (
          <button
            key={p.id}
            className={`${styles.dot} ${i === index ? styles.activeDot : ''}`}
            onClick={() => goTo(i)}
            aria-label={`${i === index ? t.projectsCarousel.currentProject + ', ' : ''}Ir al proyecto ${i + 1}${p.title ? `: ${p.title}` : ''}`}
            aria-controls={wrapperIdRef.current}
            aria-current={i === index}
            title={p.title || `Proyecto ${i + 1}`}
            data-index={i}
          />
        ))}
      </div>
    ) : null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingGrid} role="status" aria-live="polite" aria-busy="true">
          {[0, 1, 2].map(i => (
            <div key={i} className={styles.loadingCard} aria-hidden="true">
              <div className={`${styles.loadingImage} ${styles.skeleton}`} />
              <div className={styles.loadingText}>
                <div className={styles.line} style={{ width: '75%' }} />
                <div className={styles.line} style={{ width: '55%' }} />
                <div className={styles.line} style={{ width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      // Si ya tenemos proyectos cargados, mostramos un banner de aviso no intrusivo
      if (projects && projects.length > 0) {
        return (
          <div className={styles.contentWrapper}>
            <div className={styles.errorBanner} role="status" aria-live="polite">
              <strong>{t.projectsCarousel.loadingProblem}</strong> {error}
              <button
                className={styles.retryInline}
                onClick={() => fetchProjects()}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? '...' : t.projectsCarousel.retryInline}
              </button>
            </div>
            {/* Mostrar la tarjeta actual normalmente */}
            <div className={styles.imagePane}>
              <div className={styles.placeholderLarge}>{current?.title?.slice(0, 2) || 'PR'}</div>
            </div>
            <div className={styles.detailsPane} aria-live="polite">
              {/* ...existing details rendering... */}
            </div>
          </div>
        );
      }

      return (
        <div className={styles.emptyState} role="alert" aria-live="assertive">
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M12 9v6M12 18h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.emptyText}>
              <div className={styles.emptyTitle}>{t.projectsCarousel.errorLoading}</div>
              <div className={styles.emptySubtitle}>{error}</div>
              <div className={styles.emptyActions}>
                <button
                  onClick={() => fetchProjects()}
                  className={styles.emptyCta}
                  aria-busy={loading}
                >
                  {loading ? <span className={styles.btnSpinner} aria-hidden="true" /> : null}
                  {t.projectsCarousel.retry}
                </button>
                <a href="#contacto" className={styles.emptyLink}>
                  {t.projectsCarousel.contactSupport}
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!projects || projects.length === 0) {
      return (
        <div className={styles.emptyState} role="status" aria-live="polite">
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 3v4M16 3v4M12 11v6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.emptyText}>
              <div className={styles.emptyTitle}>{t.projectsCarousel.noProjects}</div>
              <div className={styles.emptySubtitle}>{t.projectsCarousel.noProjectsDescription}</div>
            </div>
          </div>
        </div>
      );
    }

    if (current?.image_url) {
      return (
        <>
          <div className={styles.bgImageLayer} aria-hidden="true" />
          <div className={styles.contentWrapper}>
            <div className={styles.imagePane}>
              <div className={styles.thumbWrapper} data-project-id={current.id}>
                {!loadedMap[current.id] && <div className={styles.skeleton} aria-hidden="true" />}
                {inViewMap[current.id] ? (
                  <img
                    src={current.image_url}
                    alt={current.title || 'project image'}
                    className={`${styles.coverImage} ${loadedMap[current.id] ? styles.imgLoaded : styles.imgHidden}`}
                    onLoad={() => markLoaded(current.id)}
                    onError={() => markLoaded(current.id)}
                  />
                ) : (
                  <div className={styles.placeholderLarge} aria-hidden="true">
                    {' '}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.detailsPane} aria-live="polite">
              <div className={styles.badgesRow}>
                {current.live_url && (
                  <a
                    href={current.live_url}
                    className={`${styles.badge} ${styles.live}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t.projectsCarousel.live}
                  >
                    {t.projectsCarousel.live}
                  </a>
                )}
                {/* Eliminamos el badge de artículo aquí para que solo aparezca como botón en projectLinks */}
                {current.status &&
                  (String(current.status) === 'completed' ? (
                    <span
                      className={`${styles.badge} ${styles.completed}`}
                      aria-label={t.projectsCarousel.completed}
                    >
                      {t.projectsCarousel.completed}
                    </span>
                  ) : (
                    <span
                      className={`${styles.badge} ${getStatusClass(current.status)}`}
                      aria-label={`Estado: ${statusHuman}`}
                    >
                      {statusHuman}
                    </span>
                  ))}
                {current.video_demo_url && (
                  <a
                    href={current.video_demo_url}
                    className={`${styles.badge} ${styles.youtube}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t.projectsCarousel.video}
                  >
                    {t.projectsCarousel.video}
                  </a>
                )}
              </div>
              <div className={styles.metaRow}>
                {current.published_at && (
                  <div
                    className={styles.metaItem}
                    aria-label={`${t.projectsCarousel.publishedOn} ${new Date(current.published_at).toLocaleDateString('es-ES')}`}
                  >
                    {new Date(current.published_at).toLocaleDateString('es-ES')}
                  </div>
                )}
              </div>
              <div className={styles.titleRow}>
                <h4 className={styles.projectTitle}>{current.title}</h4>
                {typeof current.views === 'number' && (
                  <div
                    className={styles.viewsInline}
                    aria-label={`${t.projectsCarousel.views} ${current.views}`}
                  >
                    <svg
                      className={styles.viewsIcon}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={styles.viewsCount}>{current.views}</span>
                  </div>
                )}
              </div>
              <p className={styles.projectDesc}>{current.description}</p>
              <div className={styles.chips}>
                {chipList.slice(0, 6).map((t: string, idx: number) => (
                  <SkillPill key={`${t}-${idx}`} name={t} colored className={styles.chipPill} />
                ))}
              </div>
              <div className={styles.projectLinks}>
                {current.github_url && (
                  <a
                    href={current.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.projectLink}
                  >
                    {t.projectsCarousel.code}
                  </a>
                )}
                {current.project_url && (
                  <a
                    href={current.project_url}
                    target={current.project_url.startsWith('/') ? '_self' : '_blank'}
                    rel={current.project_url.startsWith('/') ? undefined : 'noreferrer'}
                    className={`${styles.projectLink} ${styles.articleLink}`}
                  >
                    {t.projectsCarousel.article}
                  </a>
                )}
                {!footerEl && dotsNode}
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <div className={styles.contentWrapper}>
        <div className={styles.imagePane}>
          <div className={styles.placeholderLarge}>{current?.title?.slice(0, 2) || 'PR'}</div>
        </div>
        <div className={styles.detailsPane} aria-live="polite">
          <div className={styles.badgesRow}>
            {current?.live_url && (
              <a
                href={current.live_url}
                className={`${styles.badge} ${styles.live}`}
                target="_blank"
                rel="noreferrer"
                aria-label={t.projectsCarousel.live}
              >
                {t.projectsCarousel.live}
              </a>
            )}
            {current?.project_url && (
              <a
                href={current.project_url}
                className={`${styles.badge} ${styles.project}`}
                target="_blank"
                rel="noreferrer"
                aria-label={t.projectsCarousel.article}
              >
                {t.projectsCarousel.article}
              </a>
            )}
            {current?.status && (
              <span className={`${styles.badge} ${getStatusClass(current.status)}`}>
                {statusHuman}
              </span>
            )}
          </div>
          <div className={styles.titleRow}>
            <h4 className={styles.projectTitle}>{current?.title}</h4>
          </div>
          {current?.description && <p className={styles.projectDesc}>{current.description}</p>}
          <div className={styles.chips}>
            {chipList.slice(0, 6).map((t: string, idx: number) => (
              <SkillPill key={`${t}-${idx}`} name={t} colored className={styles.chipPill} />
            ))}
          </div>
          <div className={styles.projectLinks}>
            {current?.github_url && (
              <a
                href={current.github_url}
                target="_blank"
                rel="noreferrer"
                className={styles.projectLink}
              >
                {t.projectsCarousel.code}
              </a>
            )}
            {current?.project_url && (
              <a
                href={current.project_url}
                target="_blank"
                rel="noreferrer"
                className={styles.projectLink}
              >
                {t.projectsCarousel.article}
              </a>
            )}
            {!footerEl && dotsNode}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={styles.singleWrapper}
      role="region"
      aria-label={t.projectsCarousel.pagination}
      aria-roledescription="carrusel"
    >
      <div
        key={current?.id ?? 'placeholder'}
        id={wrapperIdRef.current}
        ref={wrapperRef}
        className={styles.singleView}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <span className={styles.srOnly} aria-live="polite">
          {loading
            ? t.projectsCarousel.loadingProjects
            : length > 0
              ? `${t.projectsCarousel.currentProject} ${index + 1} ${t.projectsCarousel.projectOf} ${length}: ${current?.title}`
              : t.projectsCarousel.noProjects}
        </span>

        {renderContent()}
      </div>
      {footerEl ? createPortal(dotsNode, footerEl) : null}
    </div>
  );
};

export default ProjectsCarousel;
