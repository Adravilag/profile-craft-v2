import React, { useRef, useEffect, useState } from 'react';

// Se puede crear una constante para evitar redefinirla en cada render.
const defaultObserverOptions = {
  rootMargin: '200px 0px',
  threshold: 0.01,
};

interface ObserverWrapperProps {
  children: React.ReactNode;
  placeholderHeight?: string; // Se añaden las opciones de IntersectionObserver para mayor flexibilidad.
  observerOptions?: IntersectionObserverInit;
}

const ObserverWrapper: React.FC<ObserverWrapperProps> = ({
  children,
  placeholderHeight = '100vh',
  observerOptions = defaultObserverOptions,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Usa una variable local para el observador.
    let observer: IntersectionObserver;

    if (containerRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); // Desconecta el observador una vez que el contenido es visible.
          observer.disconnect();
        }
      }, observerOptions);
      observer.observe(containerRef.current);
    } // Limpia el observador cuando el componente se desmonta.

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observerOptions]);

  return (
    <div
      ref={containerRef} // Si no es visible, añade una altura fija para evitar el "layout shift".
      style={!isVisible ? { minHeight: placeholderHeight } : {}}
    >
            {children}   {' '}
    </div>
  );
};

export default ObserverWrapper;
