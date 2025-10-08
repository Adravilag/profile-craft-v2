import { useState, useEffect, useMemo, useCallback } from 'react';
import { getProjects, getExperiences, getCertifications } from '@/services/api';
import type { UserProfile } from '@/types/api';
import { debugLog } from '@/utils/debugConfig';
import { useTranslation } from '@/contexts/TranslationContext';
import { normalizeState, PROJECT_STATES } from '@/constants/projectStates';
import { useSectionsLoadingContext } from '@/contexts/SectionsLoadingContext';
import { scrollToElement } from '@/utils/scrollToElement';

interface UseProfileStatsReturn {
  statsArray: Array<{
    key: string;
    label: string;
    icon: string;
    sectionId: string;
    onClick: () => void;
  }>;
  remoteLoading: boolean;
  remoteStats: {
    projects_count?: number;
    certifications_count?: number;
    years_experience?: number;
  } | null;
}

/**
 * Hook para gestionar las estadísticas del perfil
 * Calcula proyectos, certificaciones y años de experiencia
 */
export function useProfileStats(
  userProfile: UserProfile | null,
  isFirstTime: boolean = false
): UseProfileStatsReturn {
  const [remoteStats, setRemoteStats] = useState<{
    projects_count?: number;
    certifications_count?: number;
    years_experience?: number;
  } | null>(null);

  // Hook de traducciones (debe invocarse en el tope del hook)
  const { t } = useTranslation();

  // Sistema centralizado de loading
  const { isLoading: centralLoading, setLoading } = useSectionsLoadingContext();
  const remoteLoading = centralLoading('profile');

  // Función helper para navegación con scroll
  const navigateToSection = useCallback(async (sectionId: string) => {
    try {
      const element = document.getElementById(sectionId);
      if (element) {
        // Calcular offset dinámico para el header sticky
        const navEl = document.querySelector('.header-portfolio-nav') as HTMLElement | null;
        const navHeight = navEl ? navEl.getBoundingClientRect().height : 80;

        await scrollToElement(element, {
          offset: navHeight + 16, // 16px de margen extra
          minDur: 300,
          maxDur: 800,
        });
      }
    } catch (error) {
      debugLog.warn(`Error navigating to section ${sectionId}:`, error);
    }
  }, []);

  // Funciones de navegación memoizadas para cada sección
  const navigateToExperience = useCallback(
    () => navigateToSection('experience'),
    [navigateToSection]
  );
  const navigateToProjects = useCallback(() => navigateToSection('projects'), [navigateToSection]);
  const navigateToCertifications = useCallback(
    () => navigateToSection('certifications'),
    [navigateToSection]
  );

  // Fetch de estadísticas remotas
  useEffect(() => {
    if (isFirstTime) {
      setLoading('profile', false);
      return;
    }

    let mounted = true;

    (async () => {
      setLoading('profile', true);
      try {
        const [projectsList, certsList, experiencesList] = await Promise.all([
          getProjects(),
          getCertifications(),
          getExperiences(),
        ]);

        if (!mounted) return;

        // Contar solo proyectos completados usando la normalización de estados
        const projects_count = Array.isArray(projectsList)
          ? projectsList.filter(
              p => normalizeState(String(p.status || '')) === PROJECT_STATES.COMPLETED
            ).length
          : 0;
        const certifications_count = Array.isArray(certsList) ? certsList.length : 0;
        let years_experience = 0;
        if (Array.isArray(experiencesList) && experiencesList.length > 0) {
          const parseDate = (d?: string) => (d ? Date.parse(d) : NaN);

          // Sumaremos la duración (end - start) de cada experiencia válida.
          // Para experiencias actuales (is_current) usaremos Date.now() como end.
          const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

          let totalMs = 0;

          experiencesList.forEach(exp => {
            const start = parseDate(exp.start_date);
            if (isNaN(start)) return; // ignorar experiencias sin fecha de inicio válida

            let end: number;
            if (exp.is_current) {
              end = Date.now();
            } else {
              const parsedEnd = parseDate(exp.end_date);
              end = isNaN(parsedEnd) ? Date.now() : parsedEnd; // fallback a ahora si no hay end
            }

            const duration = Math.max(0, end - start);
            totalMs += duration;
          });

          if (totalMs > 0) {
            const totalYears = totalMs / MS_PER_YEAR;
            // redondear a años enteros, mínimo 1
            years_experience = Math.max(1, Math.round(totalYears));
          }
        }

        setRemoteStats({ projects_count, certifications_count, years_experience });
      } catch (err) {
        debugLog.warn('Failed to fetch remote stats', err);
      } finally {
        if (mounted) setLoading('profile', false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isFirstTime, setLoading]);

  // Cálculo de array de estadísticas
  const statsArray = useMemo(() => {
    const meta = (userProfile as any)?.meta || {};
    const rs = remoteStats || {};

    // Localized labels (usar `t` obtenido al tope del hook)
    const yearsLabel = `👨‍💻 +${rs.years_experience ?? meta.years_experience ?? 5} ${t.profileHero.yearsExperience}`;

    // Determinar si mostramos el contador de proyectos completados.
    // Si el valor efectivo (remoto o en meta) es 0, lo ocultamos.
    const projectsCountRaw =
      typeof (rs as any).projects_count === 'number'
        ? (rs as any).projects_count
        : typeof meta.projects_count === 'number'
          ? meta.projects_count
          : null;
    const projectsLabelValue = projectsCountRaw !== null ? projectsCountRaw : '3+';

    const certCount = rs.certifications_count ?? meta.certifications_count ?? 0;

    const items: {
      key: string;
      label: string;
      icon: string;
      sectionId: string;
      onClick: () => void;
    }[] = [
      {
        key: 'years_experience',
        label: `+${rs.years_experience ?? meta.years_experience ?? 5} ${t.profileHero.yearsExperience}`,
        icon: '👨‍💻',
        sectionId: 'experience',
        onClick: navigateToExperience,
      },
    ];

    // Añadir proyectos completados sólo si el valor efectivo no es 0.
    if (projectsCountRaw !== 0) {
      items.push({
        key: 'projects_count',
        label: `${projectsLabelValue} ${t.profileHero.projectsCompleted}`,
        icon: '📂',
        sectionId: 'projects',
        onClick: navigateToProjects,
      });
    }

    // Mostrar certificaciones solo si hay al menos una
    if (certCount > 0) {
      items.push({
        key: 'certifications_count',
        label: `${certCount} ${t.experience.certifications}`,
        icon: '🎓',
        sectionId: 'certifications',
        onClick: navigateToCertifications,
      });
    }

    return items;
  }, [
    userProfile,
    remoteStats,
    t,
    navigateToExperience,
    navigateToProjects,
    navigateToCertifications,
  ]);

  return {
    statsArray,
    remoteLoading,
    remoteStats,
  };
}
