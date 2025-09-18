import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation, useNotification } from '@/hooks';
import { debugLog } from '@/utils/debugConfig';
import { useInitialScrollToSection } from '@/hooks/useInitialScrollToSection';
import styles from './SmartNavigation.module.css';
import { scrollToElement } from '@/utils/scrollToElement';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import { useSectionsLoadingContext } from '@/contexts/SectionsLoadingContext';

interface SmartNavigationProps {
  navItems: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
}

const SmartNavigation: React.FC<SmartNavigationProps> = ({ navItems }) => {
  const nav = useNavigation() as any;
  const { currentSection, navigateToSection } = nav;
  const navigateFromProjectToSection =
    nav.navigateFromProjectToSection ?? ((s: string) => navigateToSection(s));
  const { showSuccess, showError } = useNotification();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // **INTEGRACIÓN CON SISTEMA CENTRALIZADO**
  const { isAnyLoading } = useSectionsLoadingContext();

  // **USO DEL NUEVO HOOK**
  useInitialScrollToSection({
    navItems,
    navigateToSection,
    setIsInitialLoading,
  });

  // Log para debuggear estado
  debugLog.navigation('🔄 SmartNavigation render:', { isMobile, isNavSticky });

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Detectar si estamos en una página de artículo o proyecto
  const isInProjectPage =
    location.pathname.startsWith('/project/') ||
    location.pathname.startsWith('/project/') ||
    location.pathname.startsWith('/projects/') ||
    location.pathname.startsWith('/projects/admin') ||
    location.pathname.startsWith('/projects/new') ||
    location.pathname.startsWith('/projects/edit/');

  // Determinar la sección activa actual
  const getActiveSection = () => {
    // Priorizar el estado de navegación interno (`currentSection`) para
    // que al hacer click en los items el menú se actualice inmediatamente.
    if (currentSection && currentSection !== '') return currentSection;

    // Fallback: derivar la sección desde la ruta (útil en refresh / deep-link)
    try {
      const path = location.pathname || '';
      const parts = (path || '')
        .split('/')
        .map(p => p.trim())
        .filter(Boolean);

      // Construir set de secciones válidas a partir de navItems
      const validSections = new Set(navItems.map(n => n.id));

      if (parts.length === 0) return 'home';

      // Ruta simple como /about o /projects
      if (validSections.has(parts[0])) return decodeURIComponent(parts[0]);

      // Si la sección aparece al final de la ruta
      if (parts.length > 1 && validSections.has(parts[parts.length - 1])) {
        return decodeURIComponent(parts[parts.length - 1]);
      }

      if (isInProjectPage) return 'projects';
    } catch (err) {
      debugLog.error('Error parsing path for active section:', err);
    }

    return currentSection || '';
  };
  const activeSection = getActiveSection();
  // Mostrar/ocultar nav en móvil según la sección (solo afecta a mobile)
  const navVisibilityClass = isMobile
    ? activeSection !== 'home'
      ? styles.navigationVisible
      : styles.navigationHidden
    : '';

  // Establecer altura del nav como variable CSS al montar
  useEffect(() => {
    const setNavHeightVariable = () => {
      requestAnimationFrame(() => {
        const navElement = document.querySelector(`.${styles.headerPortfolioNav}`) as HTMLElement;
        if (navElement) {
          const navHeight = navElement.offsetHeight;
          document.documentElement.style.setProperty('--header-nav-height', `${navHeight}px`);
        }
      });
    };
    setNavHeightVariable();
    const timeout = setTimeout(setNavHeightVariable, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Detectar cuando el nav debe estar sticky
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        try {
          const scrollY = window.scrollY;
          const headerElement = document.querySelector('.header-curriculum') as HTMLElement;
          const headerHeight = headerElement?.offsetHeight || 400;
          const navSticky = scrollY >= headerHeight - 80;
          setIsNavSticky(navSticky);
          const progress = Math.min(scrollY / headerHeight, 1);
          setScrollProgress(progress);
          const navElement = document.querySelector(`.${styles.headerPortfolioNav}`) as HTMLElement;
          if (navElement) {
            const navHeight = navElement.offsetHeight;
            document.documentElement.style.setProperty('--header-nav-height', `${navHeight}px`);
          }
        } finally {
          ticking = false;
        }
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Manejar navegación con lógica diferente según el contexto
  // Helper disponible en el componente para desplazar por DOM si hace falta
  const scrollToSectionComponent = async (
    section: string | null,
    el: HTMLElement | null,
    opts?: { instant?: boolean }
  ) => {
    try {
      if (!section || section === 'home' || !el) {
        // ir al top
        try {
          const navEl = document.querySelector(
            `.${styles.headerPortfolioNav}`
          ) as HTMLElement | null;
          const navHeight = navEl ? Math.round(navEl.getBoundingClientRect().height) : 0;
          await scrollToElement(0, { offset: navHeight + 8, instant: !!opts?.instant });
        } catch (e) {
          const prefersReduced =
            typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';
          window.scrollTo({ top: 0, behavior });
        }
        return;
      }

      const navEl = document.querySelector(`.${styles.headerPortfolioNav}`) as HTMLElement | null;
      const navHeightFromDom = navEl ? Math.round(navEl.getBoundingClientRect().height) : 0;
      const navHeightVar = getComputedStyle(document.documentElement).getPropertyValue(
        '--header-nav-height'
      );
      const navHeightFromVar = Number((navHeightVar || '').replace('px', '')) || 0;
      const navHeight = Math.max(0, Math.max(navHeightFromDom, navHeightFromVar));

      const elementTop = el.getBoundingClientRect().top + window.scrollY;
      let target = Math.round(elementTop - navHeight - 8);
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (target < 0) target = 0;
      if (target > maxScroll) target = maxScroll;

      debugLog.navigation('SmartNavigation scrollToSection (component)', {
        section,
        navHeight,
        elementTop,
        target,
        maxScroll,
      });

      try {
        await scrollToElement(target, { offset: navHeight + 8, instant: !!opts?.instant });
      } catch (e) {
        const prefersReduced =
          typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';
        window.scrollTo({ top: target, behavior });
      }

      // Post-correction para evitar overscroll
      requestAnimationFrame(() => {
        setTimeout(() => {
          (async () => {
            try {
              let closestId: string | null = null;
              let closestDist = Infinity;
              navItems.forEach(ni => {
                const sEl =
                  document.getElementById(ni.id) ||
                  document.querySelector(`[data-section="${ni.id}"]`);
                if (sEl instanceof HTMLElement) {
                  const rectTop = sEl.getBoundingClientRect().top;
                  const dist = Math.abs(rectTop - (navHeight + 8));
                  if (dist < closestDist) {
                    closestDist = dist;
                    closestId = ni.id;
                  }
                }
              });

              if (closestId && closestId !== section) {
                debugLog.navigation('SmartNavigation detected overscroll (component), correcting', {
                  desired: section,
                  landed: closestId,
                  closestDist,
                });
                const sEl =
                  document.getElementById(section) ||
                  document.querySelector(`[data-section="${section}"]`);
                if (sEl instanceof HTMLElement) {
                  const desiredTop = Math.round(
                    sEl.getBoundingClientRect().top + window.scrollY - navHeight - 8
                  );
                  const desiredClamped = Math.max(0, Math.min(desiredTop, maxScroll));
                  try {
                    await scrollToElement(desiredClamped, {
                      offset: navHeight + 8,
                      instant: !!opts?.instant,
                    });
                  } catch (e) {
                    const prefersReduced2 =
                      typeof window !== 'undefined' &&
                      window.matchMedia &&
                      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    const behavior2: ScrollBehavior = prefersReduced2 ? 'auto' : 'smooth';
                    window.scrollTo({ top: desiredClamped, behavior: behavior2 });
                  }
                }
              }
            } catch (err) {
              /* ignore */
            }
          })();
        }, 60);
      });
    } catch (err) {
      debugLog.error('Error scrolling to section (component):', err);
    }
  };

  const handleNavClick = useCallback(
    (sectionId: string) => {
      setIsMobileMenuOpen(false);
      const buildPathForSection = (id: string) => {
        // Build paths relative to the router basename. RouterProvider already
        // applies the configured basename (e.g. '/profile-craft'), so we must
        // avoid prefixing it again here to prevent duplication like
        // '/profile-craft/profile-craft/skills'.
        if (!id || id === 'home') return `/`;
        return `/${encodeURIComponent(id)}`;
      };
      // Si estamos en una página de artículo/proyecto hacemos una navegación completa
      // hacia la ruta canonical para que se cargue la página de secciones.
      if (isInProjectPage) {
        try {
          const newPath = buildPathForSection(sectionId);
          // Usar el enrutador para navegar correctamente
          routerNavigate(newPath);
        } catch (e) {
          debugLog.error('Error navigating from project to section (router):', e);
          // Fallback a pushState si routerNavigate falla
          try {
            window.history.pushState({}, '', buildPathForSection(sectionId));
          } catch (_) {}
        }
        return;
      } else {
        // Navegar y forzar scroll inmediato en respuesta al click del usuario
        navigateToSection(sectionId, undefined, true);
        // DOM fallback: intentar hacer scroll si el elemento ya está presente
        try {
          const el =
            document.getElementById(sectionId) ||
            (document.querySelector(`[data-section="${sectionId}"]`) as HTMLElement | null);
          if (el instanceof HTMLElement) {
            requestAnimationFrame(() => {
              void scrollToSectionComponent(sectionId, el, { instant: true });
            });
          } else {
            // Observar cambios en el DOM y hacer scroll cuando aparezca
            const obs = new MutationObserver(() => {
              const found =
                document.getElementById(sectionId) ||
                (document.querySelector(`[data-section="${sectionId}"]`) as HTMLElement | null);
              if (found instanceof HTMLElement) {
                try {
                  obs.disconnect();
                } catch (e) {}
                requestAnimationFrame(() => {
                  void scrollToSectionComponent(sectionId, found, { instant: true });
                });
              }
            });
            try {
              obs.observe(document.documentElement || document.body, {
                childList: true,
                subtree: true,
              });
              setTimeout(() => {
                try {
                  obs.disconnect();
                } catch (e) {}
              }, 5000);
            } catch (e) {
              // ignore
            }
          }
        } catch (e) {
          debugLog.error('Error doing DOM fallback scroll on nav click', e);
        }
        // Do not manually pushState here: `navigateToSection` already updates
        // the NavigationContext and the URL. Pushing state again can result
        // in duplicated base segments when RouterProvider uses a basename.
      }
    },
    [isInProjectPage, navigateFromProjectToSection, navigateToSection, routerNavigate]
  );

  // Toggle del menú móvil
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <>
      {/* LOADING: Combinar navegación inicial + loading de datos centralizadas */}
      {(isInitialLoading || isAnyLoading()) && (
        <LoadingSpinner
          fullScreen
          size={48}
          label={isInitialLoading ? 'Cargando sección…' : 'Cargando datos...'}
        />
      )}

      {/* Barra de progreso de scroll */}
      <div className={styles.scrollProgressContainer}>
        <div className={styles.scrollProgressBar} style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      {/* Navegación principal */}
      <nav
        className={`${styles.headerPortfolioNav} ${isNavSticky ? styles.navSticky : ''} ${navVisibilityClass} ${
          isMobile && isNavSticky ? styles.mobileStickyLayout : ''
        }`}
      >
        {/* Botón de menú hamburguesa a la izquierda en móvil y label de la sección activa */}
        {isMobile && activeSection !== 'home' && (
          <div className={styles.mobileHeaderRow}>
            <div className={styles.mobileSide}>
              <button
                className={`${styles.mobileMenuToggle} ${isMobileMenuOpen ? styles.active : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Abrir menú de navegación"
                aria-expanded={isMobileMenuOpen}
              >
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
              </button>
            </div>

            <div className={styles.mobileCenter}>
              <span className={styles.mobileSectionLabel}>
                {navItems.find(n => n.id === activeSection)?.label || ''}
              </span>
            </div>

            {/* Placeholder right side to keep the center aligned */}
            <div className={styles.mobileSidePlaceholder} aria-hidden="true" />
          </div>
        )}

        {/* Items de navegación - ocultos en móvil cuando sticky */}
        <div
          className={`${styles.navItemsContainer} ${
            isMobile && isNavSticky ? styles.hiddenOnMobile : ''
          }`}
        >
          {navItems.map(item => (
            <button
              key={item.id}
              className={`${styles.headerNavItem} ${
                activeSection === item.id && activeSection !== '' ? styles.active : ''
              }`}
              onClick={() => handleNavClick(item.id)}
              aria-label={`Navegar a sección ${item.label}`}
              title={`Ir a ${item.label}`}
            >
              <i className={item.icon} aria-hidden="true"></i>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Menú móvil desplegable */}
      {isMobile && activeSection !== 'home' && (
        <div
          ref={mobileMenuRef}
          className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}
        >
          <div className={styles.mobileMenuContent}>
            {/* Items de navegación */}
            <div className={styles.mobileMenuSection}>
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`${styles.mobileMenuItem} ${
                    activeSection === item.id && activeSection !== '' ? styles.active : ''
                  }`}
                  onClick={() => handleNavClick(item.id)}
                  aria-label={`Navegar a sección ${item.label}`}
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  <span>{item.label}</span>
                  {activeSection === item.id && <i className="fas fa-check" aria-hidden="true"></i>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el menú móvil */}
      {isMobile && isMobileMenuOpen && activeSection !== 'home' && (
        <div
          className={styles.mobileMenuOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default SmartNavigation;
