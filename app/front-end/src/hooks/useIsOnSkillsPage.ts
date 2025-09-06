import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getSectionFromPath } from '@/config/app';

/**
 * Hook reutilizable para detectar si la ruta actual corresponde a la sección "skills".
 * Maneja varios formatos de path y se actualiza en tiempo real.
 */
export const useIsOnSkillsPage = () => {
  const location = useLocation();
  const [isOnSkillsPage, setIsOnSkillsPage] = useState<boolean>(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : location.pathname || '';
    const section = getSectionFromPath(path);
    return section === 'skills';
  });

  useEffect(() => {
    const path = location.pathname || '';
    const section = getSectionFromPath(path);
    setIsOnSkillsPage(section === 'skills');
  }, [location.pathname]);

  return isOnSkillsPage;
};

export default useIsOnSkillsPage;
