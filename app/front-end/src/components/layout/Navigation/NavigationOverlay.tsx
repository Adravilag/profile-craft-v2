// src/components/navigation/NavigationOverlay.tsx

import React from 'react';
import { useNavigation, useData } from '@cv-maker/shared';
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

  // Generar mensaje dinámico basado en la sección objetivo
  const getMessage = () => {
    if (!targetSection) return isAnyLoading ? 'Cargando contenido...' : 'Navegando...';

    const sectionNames: { [key: string]: string } = {
      home: 'Inicio',
      about: 'Sobre mí',
      experience: 'Experiencia',
      projects: 'Proyectos',
      skills: 'Habilidades',
      certifications: 'Certificaciones',
      testimonials: 'Testimonios',
      contact: 'Contacto',
    };

    const sectionName = sectionNames[targetSection] || targetSection;
    return `Navegando a ${sectionName}...`;
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
