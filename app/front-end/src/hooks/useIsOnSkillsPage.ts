import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook reutilizable para detectar si la ruta actual corresponde a la sección "skills".
 * Maneja varios formatos de path y se actualiza en tiempo real.
 */
export const useIsOnSkillsPage = () => {
  const location = useLocation();
  const [isOnSkillsPage, setIsOnSkillsPage] = useState<boolean>(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : location.pathname || '';
    console.log(path);

    return path.includes('/skills') || path.endsWith('/skills') || path === '/profile-craft/skills';
  });

  useEffect(() => {
    const path = location.pathname || '';
    const resolved =
      path.includes('/skills') || path.endsWith('/skills') || path === '/profile-craft/skills';
    setIsOnSkillsPage(resolved);
  }, [location.pathname]);

  return isOnSkillsPage;
};

export default useIsOnSkillsPage;
