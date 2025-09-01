import React, { useEffect, useState, memo, useMemo, useRef } from 'react';
import usePDFExport from '@/hooks/usePDFExport';
import { profile as endpointsProfile } from '@/services/endpoints';
const { getUserProfile } = endpointsProfile;
import type { UserProfile, Skill } from '@/types/api';
// BlurImage not needed here; project thumbnails now use ProjectWidget
import ProjectWidget from '@/components/projects/ProjectWidget/ProjectWidget';
import PatternLogin from '@/components/Auth/PatternLogin';
import { getProfilePattern, getProjects, getExperiences, getCertifications } from '@/services/api';
import { useHeader } from '@/hooks/useHeader';
import { useAuth } from '@/contexts/AuthContext';
import InteractiveTerminal from './Widgets/Terminal/InteractiveTerminal';
import VideoCurriculum from './Widgets/VideoCurriculum/VideoCurriculum';
import ProjectsCarousel from './Widgets/ProjectsCarousel/ProjectsCarousel';
import { getImageUrl } from '@/utils/imageAssets';
import ContactTooltips from './Widgets/ContactTooltips/ContactTooltips';
import { debugLog } from '@/utils/debugConfig';
import styles from './ProfileHero.module.css';
// Import global skill color rules here so they are injected after the module CSS
import '@/styles/04-features/skills-colors.css';
import useSkills from '@/hooks/useSkills';
import SkillBadge from '@/components/ui/SkillBadge/SkillBadge';

/** Typing rotator sin fugas de timers y con control preciso */
const TypingRotator: React.FC<{
  words: string[];
  typingSpeed?: number; // ms por char
  pause?: number; // ms al final de la palabra
}> = ({ words, typingSpeed = 60, pause = 1200 }) => {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0); // índice de palabra
  const [deleting, setDeleting] = useState(false);
  const charIdx = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const clearT = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    const run = () => {
      const word = words[index % words.length];

      if (!deleting) {
        // escribir
        if (charIdx.current <= word.length) {
          setText(word.slice(0, charIdx.current));
          charIdx.current += 1;
          timeoutRef.current = window.setTimeout(run, typingSpeed);
        } else {
          // pausa al final y empezar a borrar
          timeoutRef.current = window.setTimeout(() => {
            setDeleting(true);
            timeoutRef.current = window.setTimeout(run, typingSpeed);
          }, pause);
        }
      } else {
        // borrar
        if (charIdx.current > 0) {
          charIdx.current -= 1;
          setText(word.slice(0, charIdx.current));
          timeoutRef.current = window.setTimeout(run, typingSpeed * 0.7);
        } else {
          setDeleting(false);
          setIndex(i => (i + 1) % words.length);
          timeoutRef.current = window.setTimeout(run, typingSpeed);
        }
      }
    };

    run();
    return clearT;
  }, [index, deleting, words, typingSpeed, pause]);

  return (
    <span className={styles.typingRotator}>
      {text}
      <span className={styles.cursor}>|</span>
    </span>
  );
};

interface ProfileHeroProps {
  darkMode: boolean;
  onToggleDarkMode?: () => void;
  isFirstTime?: boolean;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({
  darkMode,
  onToggleDarkMode,
  isFirstTime = false,
}) => {
  const { exportToPDF } = usePDFExport();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeWidget, setActiveWidget] = useState<'terminal' | 'video' | 'projects'>('terminal');
  // Note: removed toggle/show-more logic to always display all stats

  const { state, actions, elementRef } = useHeader({
    profileName: userProfile?.name,
    darkMode,
    onToggleDarkMode,
    exportToPDF,
  });

  // Auth status to show visual indicator on avatar
  const { isAuthenticated, logout } = useAuth();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  // (scroll helper removed as unused)

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (isFirstTime) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getUserProfile();
        setUserProfile(data);
      } catch (err) {
        debugLog.error('Failed to fetch user profile:', err);
        setError('Could not load the profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isFirstTime]);

  // Body dark mode toggler
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Check Font Awesome after mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const testIcon = document.createElement('i');
      testIcon.className = 'fa-brands fa-linkedin';
      document.body.appendChild(testIcon);
      const computedStyle = window.getComputedStyle(testIcon, '::before');
      const content = computedStyle.getPropertyValue('content');
      document.body.removeChild(testIcon);
      if (content && content !== 'none' && content !== '""') {
        debugLog.dataLoading('✅ Font Awesome loaded successfully');
      } else {
        debugLog.warn('⚠️ Font Awesome not loaded correctly');
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, []);

  // Close logout menu on Escape or when clicking outside the avatar area
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLogoutMenu(false);
    };

    const onDocClick = (ev: MouseEvent) => {
      if (!avatarRef.current) return;
      const target = ev.target as Node | null;
      if (!target) return;
      if (avatarRef.current.contains(target)) return; // click inside avatar area -> ignore
      setShowLogoutMenu(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDocClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, []);

  const renderRoleTitle = useMemo(() => {
    const role = userProfile?.role_title;
    if (!role) return null;

    if (/\bReact\b|\bSpring Boot\b/.test(role)) {
      return role.split(/(\bReact\b|\bSpring Boot\b)/g).map((part, i) =>
        part === 'React' || part === 'Spring Boot' ? (
          <span key={`${part}-${i}`} className={styles.techHighlight}>
            {part}
          </span>
        ) : (
          <span key={`t-${i}`}>{part}</span>
        )
      );
    }
    return <span>{role}</span>;
  }, [userProfile?.role_title]);

  const contactList = useMemo(() => {
    const p = userProfile;
    if (!p) return [];
    return [
      p.email && {
        type: 'email' as const,
        icon: 'fas fa-envelope',
        value: p.email,
        color: '#ea4335',
      },
      p.linkedin_url && {
        type: 'linkedin' as const,
        icon: 'fab fa-linkedin',
        value: p.linkedin_url,
        color: '#0077b5',
      },
      p.github_url && {
        type: 'github' as const,
        icon: 'fab fa-github',
        value: p.github_url,
        color: '#333333',
      },
      p.location && {
        type: 'location' as const,
        icon: 'fas fa-map-marker-alt',
        value: p.location,
        color: '#4285f4',
      },
    ].filter(Boolean) as React.ComponentProps<typeof ContactTooltips>['contacts'];
  }, [userProfile]);

  // Si el perfil no contiene el campo `pattern`, intentar obtenerlo desde el endpoint específico
  useEffect(() => {
    if (!userProfile) return;
    const currentPattern = (userProfile as any).pattern;
    if (currentPattern !== undefined && currentPattern !== null) return; // ya lo tenemos

    let mounted = true;
    (async () => {
      try {
        const candidateId = (userProfile as any)._id ?? (userProfile as any).id;
        const isObjectId = typeof candidateId === 'string' && /^[0-9a-fA-F]{24}$/.test(candidateId);
        // If candidateId is not a valid Mongo ObjectId, let getProfilePattern pick the dynamic id
        const uidToUse = isObjectId ? candidateId : undefined;
        debugLog.api(
          '🔄 Fetching pattern for user id (ProfileHero), candidate:',
          candidateId,
          'using:',
          uidToUse ?? '(dynamic)'
        );
        const resp = await getProfilePattern(uidToUse);
        debugLog.api('✅ pattern response:', resp);
        if (!mounted) return;
        if (resp && (resp.pattern ?? null) !== null) {
          setUserProfile(prev => (prev ? { ...prev, pattern: resp.pattern } : prev));
        }
      } catch (err) {
        debugLog.warn('No pattern available for user or failed to fetch pattern', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userProfile]);

  // Estadísticas: priorizar datos remotos (backend). Eliminamos 'awards' por ahora.
  const [remoteStats, setRemoteStats] = useState<{
    projects_count?: number;
    certifications_count?: number;
    years_experience?: number;
  } | null>(null);
  const [remoteLoading, setRemoteLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isFirstTime) return;
    let mounted = true;
    (async () => {
      setRemoteLoading(true);
      try {
        const [projectsList, certsList, experiencesList] = await Promise.all([
          getProjects(),
          getCertifications(),
          getExperiences(),
        ]);

        if (!mounted) return;

        const projects_count = Array.isArray(projectsList) ? projectsList.length : 0;
        const certifications_count = Array.isArray(certsList) ? certsList.length : 0;

        let years_experience = 0;
        if (Array.isArray(experiencesList) && experiencesList.length > 0) {
          const parseDate = (d?: string) => (d ? Date.parse(d) : NaN);
          const starts = experiencesList
            .map(e => parseDate(e.start_date))
            .filter(v => !isNaN(v)) as number[];
          const ends = experiencesList
            .map(e => (e.is_current ? Date.now() : parseDate(e.end_date)))
            .map(v => (isNaN(v) ? Date.now() : v)) as number[];
          if (starts.length > 0) {
            const minStart = Math.min(...starts);
            const maxEnd = Math.max(...ends);
            years_experience = Math.max(
              1,
              Math.round((maxEnd - minStart) / (1000 * 60 * 60 * 24 * 365.25))
            );
          }
        }

        setRemoteStats({ projects_count, certifications_count, years_experience });
      } catch (err) {
        debugLog.warn('Failed to fetch remote stats', err);
      } finally {
        if (mounted) setRemoteLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isFirstTime]);

  const statsArray = useMemo(() => {
    const meta = (userProfile as any)?.meta || {};
    const rs = remoteStats || {};

    const yearsLabel = `👨‍💻 +${rs.years_experience ?? meta.years_experience ?? 5} años`;
    const projectsLabel = `📂 ${rs.projects_count ?? meta.projects_count ?? '3+'} proyectos`;

    const certCount = rs.certifications_count ?? meta.certifications_count ?? 0;

    const items: { key: string; label: string }[] = [
      { key: 'years_experience', label: yearsLabel },
      { key: 'projects_count', label: projectsLabel },
    ];

    // Mostrar certificaciones solo si hay al menos una
    if (certCount > 0) {
      items.push({ key: 'certifications_count', label: `🎓 ${certCount} certificaciones` });
    }

    return items;
  }, [userProfile, remoteStats]);

  // Skills: ahora gestionadas por el hook useSkills (ver más abajo)

  // Palabras para el rotador de texto. Declarado aquí junto a los demás hooks
  // para evitar que hooks posteriores queden condicionados por retornos
  // tempranos (evita el error "Rendered more hooks than during the previous render").
  const typingWords = useMemo(
    () => [
      'Desarrollador Software',
      'Creador de experiencias interactivas',
      'Diseñador de interfaces de usuario',
      'Desarrollador de soluciones accesibles',
    ],
    []
  );

  // Fallback local de skills (se usa mientras la API no responda)
  const fallbackSkills: Skill[] = [
    {
      id: 0 as any,
      user_id: 0 as any,
      category: 'Frontend',
      name: 'React',
      level: 90,
      years_experience: 3,
      color: '#61dafb',
    },
    {
      id: 1 as any,
      user_id: 0 as any,
      category: 'Frontend',
      name: 'JavaScript',
      level: 80,
      years_experience: 5,
      color: '#f7df1e',
    },
    {
      id: 2 as any,
      user_id: 0 as any,
      category: 'Backend',
      name: 'Node.js',
      level: 75,
      years_experience: 4,
      color: '#68a063',
    },
    {
      id: 3 as any,
      user_id: 0 as any,
      category: 'Frontend',
      name: 'TypeScript',
      level: 78,
      years_experience: 3,
      color: '#3178c6',
    },
    {
      id: 4 as any,
      user_id: 0 as any,
      category: 'DevOps',
      name: 'Docker',
      level: 60,
      years_experience: 2,
      color: '#2496ed',
    },
  ];

  // Mostrar solo skills con level > 70 (umbral configurable)
  // Ajustado a 70 para mantener compatibilidad con pruebas y expectativas de contenido
  const { displayed: displayedSkills } = useSkills({
    minLevel: 70,
    sortBy: 'level',
    desc: true,
    fallback: fallbackSkills,
  });

  // Para ProfileHero queremos mostrar las skills relevantes. Durante la migración
  // y para mantener compatibilidad con las pruebas, mostramos las skills que
  // pasaron el filtro de `useSkills` (por nivel) y además cualquier skill marcada
  // explícitamente como `featured`.
  const featuredSkills = (displayedSkills || []).filter(s => {
    const lvl = (s as any)?.level;
    const isFeatured = Boolean((s as any).featured);
    return isFeatured || (typeof lvl === 'number' && lvl > 70);
  });

  // Idioma preferido, persistido en localStorage y aplicado al atributo lang del <html>
  const [lang, setLang] = useState<'es' | 'en'>(() => {
    try {
      const stored = window.localStorage.getItem('preferred_lang');
      return stored === 'en' ? 'en' : 'es';
    } catch (e) {
      return 'es';
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('preferred_lang', lang);
      document.documentElement.lang = lang;
    } catch (e) {
      /* noop */
    }
  }, [lang]);

  const toggleLang = () => setLang(l => (l === 'es' ? 'en' : 'es'));

  // Mensajes de ayuda/contexto para el área de widgets según el widget activo
  const widgetHints = useMemo(() => {
    return {
      terminal: (
        <>
          💡 Terminal interactivo: escribe comandos para explorar el CV (prueba <code>help</code>).
        </>
      ),
      video: (
        <>
          🎬 Videocurrículum: pulsa "play" para ver una presentación breve y usa los controles para
          saltar a secciones.
        </>
      ),
      projects: (
        <>📁 Proyectos: navega miniaturas y haz clic para abrir demos, capturas o repositorios.</>
      ),
    } as Record<'terminal' | 'video' | 'projects', React.ReactNode>;
  }, []);

  if (loading) {
    return (
      <header className={`${styles.headerCurriculum} ${styles.loading}`} aria-busy="true">
        <div className={styles.headerSkeleton}>
          <div className={styles.headerSkeletonContent} role="status" aria-live="polite">
            <div className={styles.headerSkeletonImage} />
            <div className={styles.headerSkeletonText}>
              <div className={`${styles.headerSkeletonLine} ${styles.long}`} />
              <div className={`${styles.headerSkeletonLine} ${styles.medium}`} />
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (isFirstTime) return null;

  if (error || !userProfile) {
    return (
      <header className={`${styles.headerCurriculum} ${styles.error}`} role="alert">
        <div className={styles.headerErrorMessage}>
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <span>{error || 'Error al cargar el perfil'}</span>
        </div>
      </header>
    );
  }

  return (
    <header
      id="home"
      ref={elementRef}
      className={`${styles.headerCurriculum} ${state.isScrolled ? styles.scrolled : ''} ${
        state.isCompact ? styles.compact : ''
      } ${!state.isVisible ? styles.hidden : ''}`}
      aria-labelledby="profile-name"
    >
      {/* Fixed controls: theme and language */}
      <div className={styles.fixedTopRight} aria-hidden={false}>
        <button
          type="button"
          className={styles.topRightButton}
          onClick={() => {
            if (onToggleDarkMode) onToggleDarkMode();
          }}
          aria-pressed={darkMode}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <i className="fas fa-sun" aria-hidden="true" />
          ) : (
            <i className="fas fa-moon" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          className={styles.topRightButton}
          onClick={toggleLang}
          title="Cambiar idioma / Toggle language"
          aria-label="Toggle language"
        >
          {lang === 'es' ? 'ES' : 'EN'}
        </button>
      </div>
      {/* Vignette overlay */}
      <div className={styles.vignette} aria-hidden="true" />

      {/* Scroll progress */}
      <div
        className={styles.headerScrollProgress}
        style={{ width: `${state.scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={state.scrollProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <div className={styles.headerContent}>
        {/* PROFILE CARD */}
        <div className={styles.headerTop}>
          <div
            ref={avatarRef}
            className={`${styles.headerAvatarContainer} ${isAuthenticated ? styles.headerAvatarContainerLogged : ''}`}
          >
            {/* PatternLogin usa la imagen real como disparador discreto para el login */}
            <PatternLogin
              src={
                userProfile.profile_image?.startsWith('http')
                  ? userProfile.profile_image
                  : getImageUrl('profilePhoto')
              }
              alt={`Foto de perfil de ${userProfile.name}`}
              className={`${styles.headerProfileImage} ${isAuthenticated ? styles.headerProfileImageLogged : ''}`}
              onClick={() => {
                if (!isAuthenticated) return;
                setShowLogoutMenu(v => !v);
              }}
              requiredCode={(userProfile as any).pattern}
            />

            {isAuthenticated && showLogoutMenu && (
              <div className={styles.logoutMenu} role="menu" aria-label="Account menu">
                <button
                  type="button"
                  className={styles.logoutButton}
                  onClick={async () => {
                    try {
                      await logout();
                    } catch (e) {
                      /* ignore */
                    } finally {
                      setShowLogoutMenu(false);
                    }
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <div className={styles.headerInfo}>
            <div className={styles.headerTextSection}>
              <h1 id="profile-name" className={styles.headerNameTitle}>
                {userProfile.name}
              </h1>

              {/* Tagline / rotating subtitle */}
              <div className={styles.headerTagline}>
                <TypingRotator words={typingWords} typingSpeed={50} pause={1200} />
              </div>

              <div className={styles.roleBadgeContainer}>
                {userProfile.role_title && (
                  <h2 className={styles.headerRoleTitle}>
                    <i
                      className="fas fa-laptop-code"
                      aria-hidden="true"
                      style={{ marginRight: 8 }}
                    />
                    {renderRoleTitle}
                  </h2>
                )}
              </div>
              {/* Location + availability */}
              <div className={styles.headerLocationAvailability}>
                <div
                  className={styles.availabilityPill}
                  role="note"
                  aria-label="Ubicación y disponibilidad"
                >
                  <span className={styles.location}>
                    <i className="fas fa-map-marker-alt" aria-hidden="true" />{' '}
                    {userProfile.location || '—'}
                  </span>
                  <span className={styles.availabilitySeparator} aria-hidden="true">
                    •
                  </span>
                  <span className={styles.availabilityText}>
                    {userProfile.status ? userProfile.status : 'Disponible'}
                  </span>
                  <span className={styles.availabilitySeparator} aria-hidden="true">
                    •
                  </span>
                  <span className={styles.modalities}>Open to remote / hybrid / freelance</span>
                </div>
              </div>
            </div>

            <div className={styles.headerContactSection}>
              <ContactTooltips contacts={contactList} compact />
            </div>

            <div className={styles.headerActionSection}>
              <div className={styles.headerActionButtons}>
                <button
                  className={`${styles.headerActionButton} ${styles.primary}`}
                  onClick={actions.handleDownloadPDF}
                  aria-label="Download CV in PDF format"
                  title="Download CV in PDF format"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? (
                    <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                  ) : (
                    <i className="fas fa-download" aria-hidden="true" />
                  )}
                  <span style={{ marginLeft: '0.5em' }}>
                    {state.isLoading ? 'Generating...' : 'Download CV'}
                  </span>
                </button>
              </div>
            </div>

            {/* Stats - mostrar siempre todas las estadísticas */}
            <div className={styles.headerHighlights} aria-live="polite">
              {remoteLoading ? (
                // Render skeletons mientras se cargan las métricas
                <>
                  <span
                    className={`${styles.statBadge} ${styles.statPrimary} ${styles.statSkeleton}`}
                  />
                  <span className={`${styles.statBadge} ${styles.statSkeleton}`} />
                </>
              ) : (
                statsArray.map(s => (
                  <span
                    key={s.key}
                    className={`${styles.statBadge} ${
                      s.key === 'years_experience' ? styles.statPrimary : ''
                    }`}
                  >
                    {s.label}
                  </span>
                ))
              )}
            </div>

            {/* Skills (hook reutilizable y componente SkillBadge) */}
            <div className={styles.stackRow} aria-hidden="false">
              {featuredSkills.map((s, idx) => (
                <SkillBadge key={`${s.name}-${idx}`} skill={s} className={styles.stackIcon} />
              ))}
            </div>

            {/* Projects preview */}
            {Array.isArray((userProfile as any).projects) &&
              (userProfile as any).projects.length > 0 && (
                <div className={styles.projectsPreview}>
                  {((userProfile as any).projects as any[]).slice(0, 4).map((p, idx) => (
                    <ProjectWidget
                      key={`${p.title ?? 'project'}-${idx}`}
                      project={p}
                      variant="thumb"
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
        {/* WIDGET: terminal / video / projects */}
        <div className={styles.headerTerminalSection}>
          <div className={styles.headerTerminalIntro}>
            <div className={styles.headerTerminalIntroRow}>
              <h3 className={styles.headerTerminalTitle}>
                <i className="fas fa-terminal" aria-hidden="true" /> Explore my CV
              </h3>

              <div className={styles.widgetControls}>
                <div className={styles.widgetButtons} role="tablist" aria-label="Widgets">
                  <button
                    type="button"
                    onClick={() => setActiveWidget('terminal')}
                    aria-pressed={activeWidget === 'terminal'}
                    className={
                      activeWidget === 'terminal' ? styles.widgetButtonActive : styles.widgetButton
                    }
                    title="Terminal"
                  >
                    <i className="fas fa-terminal" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveWidget('video')}
                    aria-pressed={activeWidget === 'video'}
                    className={
                      activeWidget === 'video' ? styles.widgetButtonActive : styles.widgetButton
                    }
                    title="Videocurrículum"
                  >
                    <i className="fas fa-video" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveWidget('projects')}
                    aria-pressed={activeWidget === 'projects'}
                    className={
                      activeWidget === 'projects' ? styles.widgetButtonActive : styles.widgetButton
                    }
                    title="Proyectos"
                  >
                    <i className="fas fa-th-large" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
            <div
              className={styles.headerTerminalHint}
              aria-live="polite"
              style={{ textAlign: 'left' }}
            >
              {widgetHints[activeWidget] ?? (
                <>
                  💡 Cambia entre widgets: <code>terminal</code>, <code>video</code>,{' '}
                  <code>projects</code>
                </>
              )}
            </div>
          </div>
          <div className={styles.headerTerminalContainer}>
            {activeWidget === 'terminal' && <InteractiveTerminal />}
            {activeWidget === 'video' && <VideoCurriculum userProfile={userProfile} />}
            {activeWidget === 'projects' && (
              <ProjectsCarousel projects={(userProfile as any)?.projects || []} />
            )}
            {/* Footer slot inside headerTerminalContainer for widgets (pagination dots, controls, etc.) */}
            <div
              id="header-terminal-footer"
              className={styles.headerTerminalFooter}
              aria-hidden="true"
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(ProfileHero);
