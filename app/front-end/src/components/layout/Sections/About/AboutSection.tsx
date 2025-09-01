import React, { useEffect, useState } from 'react';
import { useData } from '@/contexts';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useOptimizedCallback } from '@/hooks/useOptimizedCallback';
// Navigation removed: local stub
const useNavigation = () => ({ navigateToSection: (_: string) => {} });
import HeaderSection from '../../HeaderSection/HeaderSection';
import styles from './AboutSection.module.css';
import HighlightCard from '@/components/ui/HighlightCard/HighlightCard';
import imgArch from '@/assets/img/img_arquitectura_escalable.png';
import imgUx from '@/assets/img/img_experiencias_usuario.png';
import imgPerf from '@/assets/img/img_optimizacion_max_rendimiento.png';

const AboutSection: React.FC = () => {
  const [isAnimated, setIsAnimated] = useState(false);

  // Hook de datos
  const { profile, profileLoading, profileError } = useData();

  // Hook de navegación
  const { navigateToSection } = useNavigation();

  // Hook de Intersection Observer para animaciones
  const { isIntersecting, elementRef } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '50px 0px',
  });

  // Hook de callback optimizado para animaciones
  const triggerAnimation = useOptimizedCallback(
    () => {
      if (isIntersecting && !isAnimated) {
        setIsAnimated(true);
      }
    },
    [isIntersecting, isAnimated],
    { type: 'raf' }
  );

  // Función para manejar la navegación a contacto sin overlay
  const handleNavigateToContact = useOptimizedCallback(() => {
    // Simplemente navegar a la sección sin estados de carga
    navigateToSection('contact');
  }, [navigateToSection]);

  // Activar animación cuando la sección es visible
  useEffect(() => {
    triggerAnimation();
  }, [triggerAnimation]);

  if (profileLoading)
    return (
      <div className="section-cv">
        <div className={styles.aboutLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );

  if (profileError)
    return (
      <div className="section-cv">
        <div className={styles.aboutError}>
          <i className="fas fa-exclamation-triangle"></i>
          <p>{profileError}</p>
        </div>
      </div>
    );

  if (!profile) return null;

  return (
    <div className="section-cv" ref={elementRef}>
      <HeaderSection
        icon="fas fa-user"
        title="Sobre Mí"
        subtitle="Conoce mi historia, filosofía y lo que me motiva como desarrollador"
        className="about"
      />
      <div className="section-container">
        <div className={styles.aboutDescription}>
          <div
            className="about-text"
            dangerouslySetInnerHTML={{ __html: profile.about_me ?? '' }}
          />
        </div>

        <div className={styles.aboutHighlights}>
          <HighlightCard
            icon={<i className="fas fa-laptop-code" />}
            title="Arquitectura Escalable"
            descriptionHtml={`Creo sistemas que **evolucionan junto a tus necesidades**: desde APIs RESTful hasta microservicios, cada arquitectura está pensada para ofrecer **estabilidad hoy y escalabilidad mañana**.`}
            tech="React • Node.js • SQL Server • Azure"
            imageSrc={imgArch}
          />

          <HighlightCard
            icon={<i className="fas fa-mobile-alt" />}
            title="Experiencias de Usuario Excepcionales"
            descriptionHtml={`Diseño **interfaces claras y atractivas** que equilibran **usabilidad** y **estética**, ofreciendo experiencias digitales rápidas, consistentes y satisfactorias.`}
            tech="UX/UI • TypeScript • CSS3 • Responsive"
            imageSrc={imgUx}
          />

          <HighlightCard
            icon={<i className="fas fa-rocket" />}
            title="Optimización de Alto Rendimiento"
            descriptionHtml={`Mejoro el rendimiento de aplicaciones para que sean **ágiles, estables y sin esperas innecesarias**, garantizando una experiencia de uso más satisfactoria`}
            tech="Performance • SEO • DevOps • Monitoring"
            imageSrc={imgPerf}
          />
        </div>

        <div
          className={styles.aboutCollaborationNote}
          onClick={handleNavigateToContact}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNavigateToContact();
            }
          }}
          aria-label="Navegar a la sección de contacto para discutir proyectos"
        >
          <div className={styles.aboutCollabIcon}>🤝</div>
          <div className={styles.aboutCollabContent}>
            <h4>¿Tienes un proyecto desafiante?</h4>
            <p>
              Me especializo en transformar ideas complejas en soluciones digitales efectivas. Si
              buscas un desarrollador comprometido con la excelencia técnica, ¡conversemos sobre tu
              próximo proyecto!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
