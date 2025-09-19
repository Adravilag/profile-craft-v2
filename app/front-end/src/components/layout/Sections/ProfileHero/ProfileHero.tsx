import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import usePDFExport from '@/hooks/usePDFExport';
import { useAuth } from '@/contexts/AuthContext';
import PatternLogin from '@/components/Auth/PatternLogin.tsx';
import ContactTooltips from './components/ContactTooltips/ContactTooltips';
import SkillPill from '@/components/ui/SkillPill/SkillPill';
import { resolvePillFromTech } from '@/features/skills/utils/pillUtils';
import { useSkillSuggestions } from '@/features/skills/hooks/useSkillSuggestions';

// Importaciones de hooks y componentes especializados
import {
  useProfileData,
  useProfileStats,
  useWidgetManager,
  useAuthState,
  useLanguage,
  useTypingRotator,
  useSkills,
  useUserPattern,
} from './hooks';
import { useProjectsData } from '@/hooks';
import { useHeader } from '@/hooks/useHeader';
import InteractiveTerminal from './components/Widgets/Terminal/InteractiveTerminal';
import VideoCurriculum from './components/Widgets/VideoCurriculum/VideoCurriculum';
import ProjectsCarousel from './components/Widgets/ProjectsCarousel/ProjectsCarousel';

// Importaciones de utilidades y estilos
import { getImageUrl } from '@/utils/imageAssets';
import { debugLog } from '@/utils/debugConfig';
import { getContactData, getRoleTitle } from './utils/profileUtils.ts';
import styles from './ProfileHero.module.css';
import '@/styles/04-features/skills-colors.css';

// Interfaz para el componente
// Constante para controlar cuántas tecnologías mostrar
const MAX_FEATURED_SKILLS = 6;

interface ProfileHeroProps {
  isFirstTime?: boolean;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({ isFirstTime = false }) => {
  // === 1. Uso de Hooks Personalizados ===
  const { exportToPDF } = usePDFExport();
  const { userProfile, loading, error, refetchProfile } = useProfileData(isFirstTime);
  const { statsArray, remoteLoading } = useProfileStats(userProfile, isFirstTime);
  const { activeWidget, setActiveWidget, widgetHints } = useWidgetManager();
  const { showPatternAuth, setShowPatternAuth, setPatternError } = useAuthState();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { skills, getTopFeaturedSkills } = useSkills();
  const skillSuggestions = useSkillSuggestions();
  const { isAuthenticated, logout } = useAuth();

  // Hook para cargar el patrón por separado
  const userId = userProfile?.id ? String(userProfile.id) : null;
  const { pattern: userPattern } = useUserPattern(userId);

  // === 2. Estados y Referencias ===
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  // === 3. Lógica Derivada y Memoizada ===
  const typingWords = useMemo(() => {
    const fromT = t?.profileHero?.typingWords;
    if (Array.isArray(fromT) && fromT.length > 0) return fromT;
    return currentLanguage === 'en'
      ? [
          'Software Developer',
          'Interactive Experience Creator',
          'User Interface Designer',
          'Accessible Solutions Developer',
        ]
      : [
          'Desarrollador Software',
          'Creador de experiencias interactivas',
          'Diseñador de interfaces de usuario',
          'Desarrollador de soluciones accesibles',
        ];
  }, [currentLanguage, t]);

  const { currentText, reset, isTyping, isErasing } = useTypingRotator(typingWords, 25, 15, 500);
  const { state, actions, elementRef } = useHeader({
    profileName: userProfile?.name,
    exportToPDF,
  });

  const contactList = useMemo(() => getContactData(userProfile), [userProfile]);

  const featuredSkills = useMemo(() => {
    // Limitar tecnologías para evitar saturación visual
    return getTopFeaturedSkills(MAX_FEATURED_SKILLS);
  }, [getTopFeaturedSkills]);

  // Projects come from the centralized projects hook (not from userProfile)
  const { projects: projectsFromHook = [], loading: projectsLoading } = useProjectsData();
  const projects = useMemo(() => projectsFromHook || [], [projectsFromHook]);

  // === 4. Efectos Secundarios (useEffect) ===
  useEffect(() => {
    if (typingWords.length > 0) {
      reset();
    }
  }, [reset, typingWords]);

  // NOTE: theme switching (dark/light) removed — no body class toggling

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLogoutMenu(false);
    };
    const onDocClick = (ev: MouseEvent) => {
      if (!avatarRef.current?.contains(ev.target as Node)) {
        setShowLogoutMenu(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDocClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const testIcon = document.createElement('i');
      testIcon.className = 'fa-brands fa-linkedin';
      document.body.appendChild(testIcon);
      const content = window.getComputedStyle(testIcon, '::before').getPropertyValue('content');
      document.body.removeChild(testIcon);
      if (content && content !== 'none' && content !== '""') {
        debugLog.dataLoading('✅ Font Awesome loaded successfully');
      } else {
        debugLog.warn('⚠️ Font Awesome not loaded correctly');
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, []);

  // === 5. Renderizado Condicional y Lógica de Vistas ===
  if (loading)
    return (
      <header
        className={`${styles.headerCurriculum} ${styles.loading} animate-fade-in`}
        aria-busy="true"
        role="status"
      >
        <div className={styles.headerSkeleton}>
          <div
            className={`${styles.headerSkeletonContent} animate-slide-in-up`}
            role="status"
            aria-live="polite"
          >
            <div className={`${styles.headerSkeletonImage} animate-pulse`} />
            <div className={styles.headerSkeletonText}>
              <div
                className={`${styles.headerSkeletonLine} ${styles.long} animate-pulse delay-100`}
              />
              <div
                className={`${styles.headerSkeletonLine} ${styles.medium} animate-pulse delay-200`}
              />
            </div>
          </div>
        </div>
      </header>
    );

  if (isFirstTime) return null;

  if (error || !userProfile)
    return (
      <header className={`${styles.headerCurriculum} ${styles.error} animate-fade-in`} role="alert">
        <div className={`${styles.headerErrorMessage} animate-slide-in-up`}>
          <i className="fas fa-exclamation-triangle animate-bounce" aria-hidden="true" />
          <span>{error || t.states.error}</span>
        </div>
      </header>
    );

  return (
    <header
      id="home"
      ref={elementRef}
      className={`${styles.headerCurriculum} animate-fade-in`}
      aria-labelledby="profile-name"
    >
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
        <div className={`${styles.headerTop} animate-slide-in-up delay-100`}>
          <div
            ref={avatarRef}
            className={`${styles.headerAvatarContainer} ${isAuthenticated ? styles.headerAvatarContainerLogged : ''} 
              transition-transform hover:scale-105 hover:-translate-y-2`}
          >
            <PatternLogin
              src={
                userProfile.profile_image?.startsWith('http')
                  ? userProfile.profile_image
                  : getImageUrl('profilePhoto')
              }
              alt={
                t?.profileHero?.profilePhotoAlt?.replace('{name}', userProfile.name) ||
                `Profile photo of ${userProfile.name}`
              }
              className={`${styles.headerProfileImage} ${isAuthenticated ? styles.headerProfileImageLogged : ''}`}
              onClick={() => {
                if (!isAuthenticated) return;
                setShowLogoutMenu(v => !v);
              }}
              requiredCode={userPattern || undefined}
              imgAttrs={{
                fetchPriority: 'high' as any,
                width: 200,
                height: 200,
                decoding: 'async',
                loading: 'eager',
              }}
            />

            {isAuthenticated && showLogoutMenu && (
              <div
                className={`${styles.logoutMenu} animate-fade-in animate-slide-in-down`}
                role="menu"
                aria-label={t.profileHero.accountMenu}
              >
                <button
                  type="button"
                  className={`${styles.logoutButton} transition-colors hover:scale-105 active:scale-95`}
                  onClick={async () => {
                    try {
                      await logout();
                    } catch (e) {
                      // ignore
                    } finally {
                      setShowLogoutMenu(false);
                    }
                  }}
                >
                  {t.profileHero.logout}
                </button>
              </div>
            )}
          </div>

          <div className={`${styles.headerInfo} animate-slide-in-up delay-200`}>
            <div className={styles.headerTextSection}>
              <h1
                id="profile-name"
                className={`${styles.headerNameTitle} animate-fade-in delay-300`}
              >
                {userProfile.name}
              </h1>

              {/* Tagline / rotating subtitle */}
              <div className={`${styles.headerTagline} animate-fade-in delay-500`}>
                <span
                  className={`${styles.typingRotator} animate-typewriter`}
                  data-testid="typing-rotator"
                  data-typing-effect={isTyping ? 'active' : 'inactive'}
                  data-erasing-effect={isErasing ? 'active' : 'inactive'}
                >
                  {currentText}
                  <span className={`${styles.cursor} animate-blink`}>|</span>
                </span>
              </div>

              <div className={`${styles.roleBadgeContainer} animate-fade-in delay-700`}>
                {userProfile.role_title && (
                  <h2 className={styles.headerRoleTitle}>
                    <i
                      className="fas fa-laptop-code transition-transform hover:rotate-6"
                      aria-hidden="true"
                      style={{ marginRight: 8 }}
                    />
                    {getRoleTitle(userProfile.role_title, styles.techHighlight)}
                  </h2>
                )}
              </div>

              {/* Location + availability */}
              <div className={`${styles.headerLocationAvailability} animate-slide-in-up delay-300`}>
                <div
                  className={`${styles.availabilityPill} transition-all hover:scale-105`}
                  role="note"
                  aria-label={t.profileHero.locationAndAvailability}
                >
                  <span className={styles.location}>
                    <i
                      className="fas fa-map-marker-alt transition-transform hover:bounce"
                      aria-hidden="true"
                    />{' '}
                    {userProfile.location || '—'}
                  </span>
                  <span className={styles.availabilitySeparator} aria-hidden="true">
                    •
                  </span>
                  <span className={styles.availabilityText}>
                    {userProfile.status ? userProfile.status : t.profileHero.available}
                  </span>
                  <span className={styles.availabilitySeparator} aria-hidden="true">
                    •
                  </span>
                  <span className={styles.modalities}>{t.profileHero.openToRemote}</span>
                </div>
              </div>
            </div>

            <div className={`${styles.headerContactSection} animate-slide-in-left delay-400`}>
              <ContactTooltips contacts={contactList} compact />
            </div>

            <div className={`${styles.headerActionSection} animate-slide-in-up delay-500`}>
              <div className={styles.headerActionButtons}>
                <button
                  className={`${styles.headerActionButton} ${styles.primary} 
                    transition-all hover:scale-105 hover:-translate-y-1 active:scale-95`}
                  onClick={actions.handleDownloadPDF}
                  aria-label={t.profileHero.downloadCV}
                  title={t.profileHero.downloadCV}
                  disabled={state.isLoading}
                >
                  {state.isLoading ? (
                    <i className="fas fa-spinner fa-spin animate-spin" aria-hidden="true" />
                  ) : (
                    <i
                      className="fas fa-download transition-transform hover:bounce"
                      aria-hidden="true"
                    />
                  )}
                  <span style={{ marginLeft: '0.5em' }}>
                    {state.isLoading ? t.profileHero.generating : t.profileHero.downloadCV}
                  </span>
                </button>
              </div>
            </div>

            {/* Stats - mostrar siempre todas las estadísticas */}
            <div
              className={`${styles.headerHighlights} ${styles.responsiveWrap} animate-slide-in-up delay-600`}
              aria-live="polite"
            >
              {remoteLoading ? (
                <>
                  <span
                    className={`${styles.statBadge} ${styles.statPrimary} ${styles.statSkeleton} animate-pulse`}
                  />
                  <span
                    className={`${styles.statBadge} ${styles.statSkeleton} animate-pulse delay-100`}
                  />
                </>
              ) : (
                statsArray.map(s => (
                  <span
                    key={s.key}
                    className={`${styles.statBadge} ${styles.mobileOptimized} ${
                      s.key === 'years_experience' ? styles.statPrimary : ''
                    } transition-all hover:scale-105 hover:-translate-y-1`}
                  >
                    {s.label}
                  </span>
                ))
              )}
            </div>

            {/* Skills (hook reutilizable y componente SkillBadge) */}
            <div
              className={`${styles.stackRow} animate-slide-in-left delay-700`}
              aria-hidden="false"
            >
              {featuredSkills.map((s, idx) => {
                // Use the central suggestions JSON + resolver to obtain slug/svg/name/color
                const pill = resolvePillFromTech(s, skillSuggestions, idx);
                const level = (s as any).level ?? (s as any).years_experience ?? null;
                return (
                  <SkillPill
                    color={pill.color}
                    slug={pill.slug}
                    svg={pill.svg}
                    name={pill.name}
                    size={22}
                    compact
                    tooltipPosition="down"
                    colored
                    level={level}
                    key={`${pill.slug}-${idx}`}
                    className={`${styles.stackIcon} transition-transform hover:scale-110 hover:-translate-y-1 stackIcon--small`}
                  />
                );
              })}
            </div>
          </div>
        </div>
        {/* WIDGET: terminal / video / projects */}
        <div className={`${styles.headerTerminalSection} animate-slide-in-left delay-300`}>
          <div className={styles.headerTerminalIntro}>
            <div className={styles.headerTerminalIntroRow}>
              <h3 className={`${styles.headerTerminalTitle} animate-fade-in delay-400`}>
                <i
                  className="fas fa-terminal transition-transform hover:rotate-3"
                  aria-hidden="true"
                />{' '}
                {t.profileHero.exploreCV}
              </h3>
              <div className={`${styles.widgetControls} animate-slide-in-right delay-500`}>
                <div className={styles.widgetButtons} role="tablist" aria-label="Widgets">
                  <button
                    type="button"
                    onClick={() => setActiveWidget('terminal')}
                    aria-pressed={activeWidget === 'terminal'}
                    className={`${
                      activeWidget === 'terminal' ? styles.widgetButtonActive : styles.widgetButton
                    } transition-all hover:scale-105 active:scale-95`}
                    title={t.profileHero.terminal}
                  >
                    <i
                      className="fas fa-terminal transition-transform hover:rotate-3"
                      aria-hidden="true"
                    />
                  </button>
                  {/* BOTÓN VIDEOCV OCULTO TEMPORALMENTE
                  <button
                    type="button"
                    onClick={() => setActiveWidget('video')}
                    aria-pressed={activeWidget === 'video'}
                    className={`$${
                      activeWidget === 'video' ? styles.widgetButtonActive : styles.widgetButton
                    } transition-all hover:scale-105 active:scale-95`}
                    title={t.profileHero.videoCurriculum}
                  >
                    <i
                      className="fas fa-video transition-transform hover:rotate-3"
                      aria-hidden="true"
                    />
                  </button>
                  */}
                  {projects && projects.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveWidget('projects')}
                      aria-pressed={activeWidget === 'projects'}
                      className={`${
                        activeWidget === 'projects'
                          ? styles.widgetButtonActive
                          : styles.widgetButton
                      } transition-all hover:scale-105 active:scale-95`}
                      title={t.profileHero.projects}
                    >
                      <i
                        className="fas fa-th-large transition-transform hover:rotate-3"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div
              className={`${styles.headerTerminalHint} animate-fade-in delay-600`}
              aria-live="polite"
              style={{ textAlign: 'left' }}
            >
              {widgetHints[activeWidget] ?? (
                <>
                  💡 <span>{t.profileHero.changeWidgets}: </span>
                  <code>{t.profileHero.terminal.toLowerCase()}</code>,{' '}
                  <code>{t.profileHero.videoCurriculum.toLowerCase()}</code>,{' '}
                  <code>{t.profileHero.projects.toLowerCase()}</code>
                </>
              )}
            </div>
          </div>
          <div className={`${styles.headerTerminalContainer} animate-zoom-in delay-700`}>
            {activeWidget === 'terminal' && <InteractiveTerminal />}
            {activeWidget === 'video' && <VideoCurriculum userProfile={userProfile} />}
            {activeWidget === 'projects' && <ProjectsCarousel projects={projects} />}
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
