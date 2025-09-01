import { useEffect } from 'react';

/**
 * Hook para manejar el estado de carga global de la aplicación.
 * Controla el atributo `data-app-loading` en el elemento raíz del DOM.
 */
export const useAppLoadingState = (isLoading: boolean) => {
  useEffect(() => {
    const root = document.documentElement;

    if (isLoading) {
      root.setAttribute('data-app-loading', 'true');
    } else {
      root.removeAttribute('data-app-loading');
    }

    // Función de limpieza para asegurarse de que el atributo se elimine al desmontar
    return () => root.removeAttribute('data-app-loading');
  }, [isLoading]);
};
