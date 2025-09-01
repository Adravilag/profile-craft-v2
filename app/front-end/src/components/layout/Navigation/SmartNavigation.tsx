import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation, useNotification } from '@/hooks';
import { debugLog } from '@/utils/debugConfig';
import { useInitialScrollToSection } from '@/hooks/useInitialScrollToSection';
import styles from './SmartNavigation.module.css';
import { scrollToElement } from '@/utils/scrollToElement';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';

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
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('cv-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // **USO DEL NUEVO HOOK**
  useInitialScrollToSection({
    navItems,
    navigateToSection,
    setIsInitialLoading,
  });

  // Log para debuggear estado
  debugLog.navigation('🔄 SmartNavigation render:', { isMobile, isNavSticky, currentTheme });

  // Aplicar tema inicial al documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

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
    location.pathname.startsWith('/profile-craft/projects/') ||
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

      // Caso con prefijo /profile-craft/section
      if (parts[0] === 'profile-craft') {
        if (parts.length === 1) return 'home';
        const maybe = decodeURIComponent(parts[1]);
        if (validSections.has(maybe)) return maybe;
      }

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

  // Establecer altura del nav como variable CSS al montar
  useEffect(() => {
    const setNavHeightVariable = () => {
      const navElement = document.querySelector(`.${styles.headerPortfolioNav}`) as HTMLElement;
      if (navElement) {
        const navHeight = navElement.offsetHeight;
        document.documentElement.style.setProperty('--header-nav-height', `${navHeight}px`);
      }
    };
    setNavHeightVariable();
    const timeout = setTimeout(setNavHeightVariable, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Detectar cuando el nav debe estar sticky
  useEffect(() => {
    const handleScroll = () => {
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

  // Manejar cambio de tema día/noche
  const handleToggleTheme = useCallback(() => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('cv-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    showSuccess(
      `Modo ${newTheme === 'light' ? 'Claro' : 'Oscuro'} activado`,
      `El tema se ha cambiado exitosamente`
    );
  }, [currentTheme, showSuccess]);

  // Manejar descarga del CV
  const handleDownloadCV = useCallback(async () => {
    try {
      const googleDriveFileId = '1vNkB5NRzjiKyrs3ug3y8tkUtyB6IT0sb';
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${googleDriveFileId}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'adrián-portillo-cv-portfolio.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('CV Descargado', 'Tu curriculum se ha descargado desde Google Drive');
    } catch (error) {
      debugLog.error('Error downloading CV from Google Drive:', error);
      showError('Error de descarga', 'Hubo un problema al descargar el CV. Inténtalo de nuevo.');
    }
  }, [showSuccess, showError]);

  // Manejar compartir enlace
  const handleShareLink = useCallback(async () => {
    const currentUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'CV - Adrián Portillo',
          text: 'Mira el portafolio profesional de Adrián Portillo',
          url: currentUrl,
        });
        showSuccess('Enlace compartido', 'El enlace se ha compartido exitosamente');
      } else {
        await navigator.clipboard.writeText(currentUrl);
        showSuccess('Enlace copiado', 'El enlace se ha copiado al portapapeles');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        debugLog.error('Error al compartir:', error);
        try {
          await navigator.clipboard.writeText(currentUrl);
          showSuccess('Enlace copiado', 'El enlace se ha copiado al portapapeles');
        } catch (clipboardError) {
          debugLog.error('Error al copiar al portapapeles:', clipboardError);
          showError('Error al compartir', 'No se pudo compartir o copiar el enlace');
        }
      }
    }
  }, [showSuccess, showError]);

  return (
    <>
      {isInitialLoading && <LoadingSpinner fullScreen size={48} label="Cargando sección…" />}
      {/* Barra de progreso de scroll */}
      <div className={styles.scrollProgressContainer}>
        <div className={styles.scrollProgressBar} style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      {/* Navegación principal */}
      <nav className={`${styles.headerPortfolioNav} ${isNavSticky ? styles.navSticky : ''}`}>
        {/* Botón de menú hamburguesa - solo visible en móvil cuando está sticky */}
        {isMobile && isNavSticky && (
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

        {/* Botones de acción - solo visible en móvil cuando está sticky */}
        {isMobile && isNavSticky && (
          <div className={styles.adminButtons}>
            <button
              className={styles.adminActionBtn}
              onClick={handleToggleTheme}
              aria-label={`Cambiar a modo ${currentTheme === 'light' ? 'oscuro' : 'claro'}`}
              title={`Modo ${currentTheme === 'light' ? 'Oscuro' : 'Claro'}`}
            >
              <i
                className={`fas ${currentTheme === 'light' ? 'fa-moon' : 'fa-sun'}`}
                aria-hidden="true"
              ></i>
            </button>
            <button
              className={styles.adminActionBtn}
              onClick={handleDownloadCV}
              aria-label="Descargar CV"
              title="Descargar CV"
            >
              <i className="fas fa-download" aria-hidden="true"></i>
            </button>
            <button
              className={styles.adminActionBtn}
              onClick={handleShareLink}
              aria-label="Compartir enlace"
              title="Compartir"
            >
              <i className="fas fa-share-alt" aria-hidden="true"></i>
            </button>
          </div>
        )}
      </nav>

      {/* Menú móvil desplegable */}
      {isMobile && isNavSticky && (
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
      {isMobile && isMobileMenuOpen && (
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
