import React, { useEffect, useState } from 'react';
import useNavigation from '@/hooks/useNavigation';
import { scrollToElement } from '@/utils/scrollToElement';
import styles from './Footer.module.css';
import { profile } from '@/services/endpoints';
const { getUserProfile } = profile;
import type { UserProfile } from '@/types/api';
import { useTranslation } from '@/contexts/TranslationContext';

interface FooterProps {
  className?: string;
  profile?: UserProfile | null; // Optional profile prop
}

const Footer: React.FC<FooterProps> = ({ className = '', profile: profileProp }) => {
  const currentYear = new Date().getFullYear();
  // Obtener la función de navegación y la sección actual del hook una vez en el nivel del componente
  const { navigateToSection, currentSection } = useNavigation();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(profileProp || null);
  const [loading, setLoading] = useState(!profileProp);
  const [error, setError] = useState<string | null>(null);

  // Load profile data if not provided as prop
  useEffect(() => {
    if (!profileProp) {
      getUserProfile()
        .then(data => {
          setProfile(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading profile for footer:', err);
          setError('No se pudo cargar la información del perfil');
          setLoading(false);
        });
    } else {
      setProfile(profileProp);
      setLoading(false);
    }
  }, [profileProp]);

  // Update profile when prop changes
  useEffect(() => {
    if (profileProp) {
      setProfile(profileProp);
      setLoading(false);
      setError(null);
    }
  }, [profileProp]);

  // Build social links from profile data with fallbacks
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: profile?.linkedin_url || 'https://linkedin.com',
      icon: 'fa-brands fa-linkedin',
      color: '#0077b5',
      ariaLabel: 'Visitar perfil de LinkedIn',
      show: !!profile?.linkedin_url, // Only show if URL exists
    },
    {
      name: 'GitHub',
      url: profile?.github_url || 'https://github.com',
      icon: 'fa-brands fa-github',
      color: '#333',
      ariaLabel: 'Visitar perfil de GitHub',
      show: !!profile?.github_url, // Only show if URL exists
    },
    {
      name: 'Email',
      url: `mailto:${profile?.email_contact || 'contact@example.com'}`,
      icon: 'fas fa-envelope',
      color: '#ea4335',
      ariaLabel: 'Enviar email',
      show: !!profile?.email_contact, // Only show if email_contact exists
    },
  ].filter(link => link.show); // Filter out links without real data

  const basePath = '/';

  const quickLinks = [
    { name: 'Inicio', id: 'home', href: `${basePath}/` },
    { name: 'Sobre mí', id: 'about', href: `${basePath}/about` },
    { name: 'Experiencia', id: 'experience', href: `${basePath}/experience` },
    { name: 'Proyectos', id: 'projects', href: `${basePath}/projects` },
    { name: 'Contacto', id: 'contact', href: `${basePath}/contact` },
  ];

  const legalLinks = [
    { name: 'Privacidad', href: '/privacy' },
    { name: 'Términos', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
  ];

  // Show loading skeleton while data is being fetched
  if (loading) {
    return (
      <footer
        className={`${styles.footer} ${className} ${styles.loading}`}
        role="contentinfo"
        aria-label="Información del sitio web"
      >
        <div className={styles.footerContainer}>
          <div className={styles.footerMain}>
            <div className={styles.footerSection}>
              <div className={styles.brandSection}>
                <div className={styles.logoContainer}>
                  <div className={styles.brandIcon}>
                    <i className="fas fa-code" aria-hidden="true"></i>
                  </div>
                  <div className={styles.brandText}>
                    <h3 className={styles.brandName}>Mi Portafolio</h3>
                    <p className={styles.brandTagline}>Cargando información del perfil...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Show error message if profile couldn't be loaded
  if (error && !profile) {
    console.warn('Footer: Error loading profile:', error);
  }

  return (
    <footer
      className={`${styles.footer} ${className}`}
      role="contentinfo"
      aria-label="Información del sitio web"
    >
      {/* Patrón decorativo superior */}
      <div className={styles.decorativePattern} aria-hidden="true">
        <div className={styles.patternElement}></div>
        <div className={styles.patternElement}></div>
        <div className={styles.patternElement}></div>
      </div>

      <div className={styles.footerContainer}>
        {/* Sección principal del footer */}
        <div className={styles.footerMain}>
          {/* Información del desarrollador */}
          <div className={styles.footerSection}>
            <div className={styles.brandSection}>
              <div className={styles.logoContainer}>
                <div className={styles.brandIcon}>
                  <i className="fas fa-code" aria-hidden="true"></i>
                </div>
                <div className={styles.brandText}>
                  <h3 className={styles.brandName}>
                    {profile?.name || t.footer.brandNameFallback}
                  </h3>
                  <p className={styles.brandTagline}>{t.footer.brandTagline}</p>
                </div>
              </div>

              {/* Redes sociales */}
              <div className={styles.socialSection}>
                <h4 className={styles.sectionTitle}>{t.footer.followTitle}</h4>
                <div className={styles.socialLinks} role="list">
                  {socialLinks.map(social => (
                    <a
                      key={social.name}
                      href={social.url}
                      className={`${styles.socialLink} ${styles.enhancedHover}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      style={{ '--social-color': social.color } as React.CSSProperties}
                      role="listitem"
                    >
                      <i className={social.icon} aria-hidden="true"></i>
                      <span className={styles.socialName}>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className={styles.footerSection}>
            {/* Separador visual */}
            <div className={styles.sectionSeparator}></div>
            <h4 className={styles.sectionTitle}>{t.footer.navigationTitle}</h4>
            <nav className={styles.quickLinksNav} aria-label="Enlaces rápidos">
              <ul className={styles.quickLinks} role="list">
                {quickLinks.map(link => (
                  <li key={link.name} role="listitem">
                    <a
                      href={link.href}
                      className={`${styles.quickLink} ${currentSection === link.id ? styles.active : ''}`}
                      onClick={async e => {
                        e.preventDefault();

                        try {
                          // Usar el sistema de navegación centralizado
                          navigateToSection(link.id as string);

                          // Hacer scroll inteligente a la sección
                          const targetElement = document.getElementById(link.id as string);
                          if (targetElement) {
                            // Calcular offset para el header/nav
                            const headerEl = document.querySelector(
                              '.header-curriculum'
                            ) as HTMLElement | null;
                            const navEl = document.querySelector(
                              '.header-portfolio-nav'
                            ) as HTMLElement | null;

                            const headerHeight = headerEl
                              ? headerEl.getBoundingClientRect().height
                              : 0;
                            const navHeight = navEl ? navEl.getBoundingClientRect().height : 0;
                            const totalOffset = Math.max(headerHeight, navHeight) + 16; // 16px extra spacing

                            await scrollToElement(targetElement, {
                              offset: totalOffset,
                              minDur: 300,
                              maxDur: 800,
                            });
                          }
                        } catch (err) {
                          console.warn('Error en navegación desde Footer:', err);

                          // Fallback: scroll básico con elemento encontrado
                          const el = document.getElementById(link.id as string);
                          if (el) {
                            try {
                              // Scroll suave respetando preferencias de accesibilidad
                              const prefersReduced = window.matchMedia(
                                '(prefers-reduced-motion: reduce)'
                              ).matches;
                              const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';

                              el.scrollIntoView({
                                behavior,
                                block: 'start',
                                inline: 'nearest',
                              });

                              // Actualizar URL sin recargar
                              window.history.pushState(null, '', link.href);
                            } catch (scrollErr) {
                              // Último fallback: navegación directa
                              console.warn(
                                'Scroll fallback falló, navegando directamente:',
                                scrollErr
                              );
                              window.location.href = link.href;
                            }
                          } else {
                            // Si no hay elemento, navegar a la ruta
                            window.location.href = link.href;
                          }
                        }
                      }}
                    >
                      <i className="fas fa-chevron-right" aria-hidden="true"></i>
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Información de contacto */}
          <div className={`${styles.footerSection} ${styles.gradientBackground}`}>
            {/* Separador visual */}
            <div className={styles.sectionSeparator}></div>
            <h4 className={styles.sectionTitle}>{t.footer.contactTitle}</h4>
            <div className={styles.contactInfo}>
              {profile?.location && (
                <div className={styles.contactItem}>
                  <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.email_contact && (
                <div className={styles.contactItem}>
                  {(() => {
                    const email = profile.email_contact;
                    const subject = t.footer.emailSubject;
                    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
                    const name = profile.name || '';
                    const bodyTemplate = t.footer.emailBody || '';
                    const body = bodyTemplate.replace('{name}', name).replace('{url}', currentUrl);

                    const mailto = `mailto:${email}?subject=${encodeURIComponent(
                      subject
                    )}&body=${encodeURIComponent(body)}`;

                    return (
                      <a
                        href={mailto}
                        className={styles.contactLink}
                        aria-label={t.footer.sendEmailAria.replace('{email}', email)}
                      >
                        <i className="fas fa-envelope" aria-hidden="true"></i>
                        {email}
                      </a>
                    );
                  })()}
                </div>
              )}
              {profile?.phone && (
                <div className={styles.contactItem}>
                  <i className="fas fa-phone" aria-hidden="true"></i>
                  <span>{profile.phone}</span>
                </div>
              )}

              {/* Fallback message when profile data is loading or missing */}
              {!profile?.location && !profile?.email_contact && !profile?.phone && !loading && (
                <div className={styles.contactItem}>
                  <i className="fas fa-info-circle" aria-hidden="true"></i>
                  <span>{t.footer.contactFallback}</span>
                </div>
              )}
            </div>

            {/* Estado de disponibilidad */}
            <div className={styles.availabilityStatus}>
              <div className={styles.statusIndicator}>
                <div className={styles.statusDot}></div>
                <span className={styles.statusText}>
                  {profile?.status || t.footer.availabilityDefault}
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className={`${styles.footerSection} ${styles.gradientBackground}`}>
            {/* Separador visual */}
            <div className={styles.sectionSeparator}></div>
            <h4 className={styles.sectionTitle}>{t.footer.newsletterTitle}</h4>
            <p className={styles.newsletterDescription}>{t.footer.newsletterDescription}</p>
            <form className={styles.newsletterForm} onSubmit={e => e.preventDefault()}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder={profile?.email_contact || t.footer.newsletterPlaceholder}
                  className={styles.emailInput}
                  aria-label={t.footer.subscribeAria}
                  required
                />
                <button
                  type="submit"
                  className={styles.subscribeButton}
                  aria-label={t.footer.subscribeAria}
                >
                  <i className="fas fa-paper-plane" aria-hidden="true"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className={styles.footerDivider}></div>

        {/* Pie de página */}
        <div className={styles.footerBottom}>
          <div className={styles.copyrightSection}>
            <p className={styles.copyright}>
              © {currentYear} {profile?.name || t.footer.brandNameFallback} (@Adavilag)
            </p>
          </div>

          <div className={styles.legalLinks}>
            {legalLinks.map((link, index) => (
              <React.Fragment key={link.name}>
                <a
                  href={link.href}
                  className={styles.legalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.name}
                </a>
                {index < legalLinks.length - 1 && (
                  <span className={styles.separator} aria-hidden="true">
                    •
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Tecnologías utilizadas */}
          <div className={styles.techStack}>
            <span className={styles.techLabel}>Desarrollado con:</span>
            <div className={styles.techIcons}>
              <i className="fab fa-react" title="React" aria-label="React"></i>
              <i className="fab fa-js-square" title="JavaScript" aria-label="JavaScript"></i>
              <i className="fab fa-css3-alt" title="CSS3" aria-label="CSS3"></i>
              <i className="fab fa-html5" title="HTML5" aria-label="HTML5"></i>
            </div>
          </div>
        </div>
      </div>

      {/* 
        Nota: ScrollToTopButton se maneja externamente en CurriculumMD3.tsx
        para evitar duplicación de funcionalidad 
      */}
    </footer>
  );
};

export default Footer;
