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
