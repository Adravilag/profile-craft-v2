import { useState, useEffect, useMemo } from 'react';
import { getProjects, getExperiences, getCertifications } from '@/services/api';
import type { UserProfile } from '@/types/api';
import { debugLog } from '@/utils/debugConfig';
import { useTranslation } from '@/contexts/TranslationContext';
import { normalizeState, PROJECT_STATES } from '@/features/projects/constants/projectStates';
import { useSectionsLoadingContext } from '@/contexts/SectionsLoadingContext';

interface UseProfileStatsReturn {
  statsArray: Array<{ key: string; label: string }>;
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

          // Obtener todas las fechas de inicio válidas
          const startDates = experiencesList
            .map(e => parseDate(e.start_date))
            .filter(v => !isNaN(v)) as number[];

          if (startDates.length > 0) {
            // Fecha de inicio más temprana
            const earliestStart = Math.min(...startDates);

            // Determinar la fecha de fin más tardía
            let latestEnd = 0;

            // Buscar experiencias actuales primero
            const currentExperiences = experiencesList.filter(e => e.is_current);
            if (currentExperiences.length > 0) {
              // Si hay experiencias actuales, usar fecha actual como fin
              latestEnd = Date.now();
            } else {
              // Si no hay experiencias actuales, buscar la fecha de fin más tardía
              const endDates = experiencesList
                .map(e => parseDate(e.end_date))
                .filter(v => !isNaN(v)) as number[];

              if (endDates.length > 0) {
                latestEnd = Math.max(...endDates);
              } else {
                // Si no hay fechas de fin válidas, usar fecha actual como fallback
                latestEnd = Date.now();
              }
            }

            // Calcular años de experiencia
            years_experience = Math.max(
              1,
              Math.round((latestEnd - earliestStart) / (1000 * 60 * 60 * 24 * 365.25))
            );
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
    const projectsLabel = `📂 ${rs.projects_count ?? meta.projects_count ?? '3+'} ${t.profileHero.projectsCompleted}`;

    const certCount = rs.certifications_count ?? meta.certifications_count ?? 0;

    const items: { key: string; label: string }[] = [
      { key: 'years_experience', label: yearsLabel },
      { key: 'projects_count', label: projectsLabel },
    ];

    // Mostrar certificaciones solo si hay al menos una
    if (certCount > 0) {
      items.push({
        key: 'certifications_count',
        label: `🎓 ${certCount} ${t.experience.certifications}`,
      });
    }

    return items;
  }, [userProfile, remoteStats, t]);

  return {
    statsArray,
    remoteLoading,
    remoteStats,
  };
}
