// src/components/navigation/SmartScrollIndicator.tsx

import React, { useState, useEffect } from 'react';
import { useNavigation, useAuth } from '@cv-maker/shared';
import './SmartScrollIndicator.css';

interface ScrollState {
  headerVisible: boolean;
  navSticky: boolean;
  scrollProgress: number;
  currentSection: string;
  sectionProgress: number;
}

const SmartScrollIndicator: React.FC = () => {
  const { currentSection } = useNavigation();
  const { user, isAuthenticated } = useAuth();

  // Verificar si es administrador
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const [scrollState, setScrollState] = useState<ScrollState>({
    headerVisible: true,
    navSticky: false,
    scrollProgress: 0,
    currentSection: 'about',
    sectionProgress: 0,
  });

  const sections = [
    { id: 'home', label: 'Inicio', icon: 'fas fa-home' },
    { id: 'about', label: 'Sobre mí', icon: 'fas fa-user' },
    { id: 'experience', label: 'Experiencia', icon: 'fas fa-briefcase' },
    { id: 'projects', label: 'Proyectos', icon: 'fas fa-project-diagram' },
    { id: 'skills', label: 'Habilidades', icon: 'fas fa-tools' },
    { id: 'certifications', label: 'Certificaciones', icon: 'fas fa-certificate' },
    { id: 'testimonials', label: 'Testimonios', icon: 'fas fa-comments' },
    { id: 'contact', label: 'Contacto', icon: 'fas fa-envelope' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headerHeight = 400;
      const navHeight = 80;

      // Calcular estados básicos
      const headerVisible = scrollY < headerHeight;
      const navSticky = scrollY >= headerHeight - navHeight;
      const scrollProgress = Math.min(scrollY / headerHeight, 1);

      // Calcular progreso de la sección actual
      let sectionProgress = 0;
      const currentSectionElement =
        document.getElementById(currentSection) ||
        document.querySelector(`[data-section="${currentSection}"]`);

      if (currentSectionElement) {
        const sectionRect = currentSectionElement.getBoundingClientRect();
        const sectionTop = sectionRect.top + scrollY;
        const sectionHeight = sectionRect.height;
        const viewportHeight = window.innerHeight;

        if (scrollY + navHeight >= sectionTop && scrollY < sectionTop + sectionHeight) {
          const sectionScrolled = scrollY + navHeight - sectionTop;
          sectionProgress = Math.min(
            sectionScrolled / (sectionHeight - viewportHeight + navHeight),
            1
          );
          sectionProgress = Math.max(0, sectionProgress);
        }
      }

      setScrollState({
        headerVisible,
        navSticky,
        scrollProgress,
        currentSection,
        sectionProgress,
      });
    };

    // Initial call
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentSection]);

  const currentSectionData = sections.find(s => s.id === currentSection);

  return (
    <div className="smart-scroll-indicator">
      {/* Barra de progreso principal */}
      <div
        className="header-progress-bar"
        style={{
          width: `${scrollState.scrollProgress * 100}%`,
          opacity: scrollState.headerVisible ? 1 : 0.7,
        }}
      />

      {/* Indicador de sección actual */}
      <div className={`scroll-section-indicator ${scrollState.navSticky ? 'nav-sticky' : ''}`}>
        <div className="section-info">
          {currentSectionData && (
            <>
              <div className="section-icon">
                <i className={currentSectionData.icon}></i>
              </div>
              <div className="section-details">
                <span className="section-name">{currentSectionData.label}</span>
                <div className="section-progress-bar">
                  <div
                    className="section-progress-fill"
                    style={{ width: `${scrollState.sectionProgress * 100}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        {/* Mini navegador de secciones */}
        <div className="mini-section-nav">
          {sections.map(section => (
            <div
              key={section.id}
              className={`mini-nav-dot ${section.id === currentSection ? 'active' : ''}`}
              title={section.label}
              style={{
                backgroundColor:
                  section.id === currentSection ? '#6366f1' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Estado del scroll (debug) - Solo para administradores */}
      {process.env.NODE_ENV === 'development' && isAdmin && (
        <div className="scroll-debug-info">
          <small>
            Section: {currentSection} | Progress: {Math.round(scrollState.sectionProgress * 100)}% |
            Sticky: {scrollState.navSticky ? 'Yes' : 'No'}
          </small>
        </div>
      )}
    </div>
  );
};

export default SmartScrollIndicator;
