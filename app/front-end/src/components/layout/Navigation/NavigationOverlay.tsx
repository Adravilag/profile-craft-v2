// src/components/navigation/NavigationOverlay.tsx

import React from 'react';
import { useNavigation, useData } from '@cv-maker/shared';
import { useTranslation } from '@/contexts/TranslationContext';
import './ScrollOverlay.css';

/**
 * Overlay mejorado que se muestra durante la navegación entre secciones
 * Proporciona feedback visual durante el scroll programático y la carga de datos
 */
const NavigationOverlay: React.FC = () => {
  const { showScrollOverlay, targetSection, isNavigating } = useNavigation();
  const { isAnyLoading } = useData();

  // Solo mostrar el overlay si estamos navegando
  const isVisible = showScrollOverlay || isNavigating || isAnyLoading;

  if (!isVisible) return null;

  // Traducciones
  const { t, getText } = useTranslation();

  // Generar mensaje dinámico basado en la sección objetivo
  const getMessage = () => {
    if (!targetSection)
      return isAnyLoading
        ? getText('states.loading', 'Cargando contenido...')
        : getText('navigation.navigating', 'Navegando...');

    const sectionNames: { [key: string]: string } = {
      home: getText('navigation.home', 'Inicio'),
      about: getText('navigation.about', 'Sobre mí'),
      experience: getText('navigation.experience', 'Experiencia'),
      projects: getText('navigation.projects', 'Proyectos'),
      skills: getText('navigation.skills', 'Habilidades'),
      certifications: getText('projectsSection.subtitleProjects', 'Certificaciones'),
      testimonials: getText('navigation.testimonials', 'Testimonios'),
      contact: getText('navigation.contact', 'Contacto'),
    };

    const sectionName = sectionNames[targetSection] || targetSection;
    return getText('navigation.navigatingTo', `Navegando a ${sectionName}...`).replace(
      '{section}',
      sectionName
    );
  };

  // Función para prevenir cualquier interacción
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // No hacer nada, solo bloquear la interacción
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Bloquear teclas durante la navegación
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Bloquear interacciones táctiles
  };

  return (
    <div
      className={`scroll-overlay default ${isVisible ? 'show' : ''}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      onMouseDown={handleOverlayClick}
      onTouchStart={handleTouchStart}
    >
      <div className="scroll-indicator">
        <div className="scroll-icon"></div>
        <span>{getMessage()}</span>
      </div>
    </div>
  );
};

export default NavigationOverlay;
