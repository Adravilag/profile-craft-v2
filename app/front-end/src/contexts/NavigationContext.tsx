import { createContext, useState, useContext, useEffect } from 'react';
import { pathStartsWithBase, stripBaseFromPath } from '@/config/basePath';
import type { ReactNode, Dispatch, SetStateAction } from 'react';

type NavigationContextType = {
  activeLink: string;
  setActiveLink: Dispatch<SetStateAction<string>>;
};

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar usando la ruta actual si está disponible en el cliente
  const deriveFromPath = (path: string) => {
    try {
      if (!path) return '';
      if (!pathStartsWithBase(path)) return '';
      const stripped = stripBaseFromPath(path);
      if (!stripped || stripped === '/' || stripped === '') return 'home';
      const m = stripped.match(/^\/([^\/\?#]+)/);
      return m && m[1] ? decodeURIComponent(m[1]) : '';
    } catch (err) {
      return '';
    }
  };

  const [activeLink, setActiveLink] = useState(() => {
    if (typeof window === 'undefined') return '';
    return deriveFromPath(window.location.pathname) || '';
  });

  // Sincronizar si la ruta cambia por manipulación externa
  useEffect(() => {
    const onPop = () => {
      setActiveLink(deriveFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <NavigationContext.Provider value={{ activeLink, setActiveLink }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
