import React from 'react';
import { createPortal } from 'react-dom';

const FABPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof document === 'undefined') return <>{children}</>;
  const id = 'fab-portal-root';
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    // Usar un z-index menor al overlay del modal (TestimonialModal usa 1100)
    // para evitar que el portal del FAB quede visualmente por encima del modal.
    container.style.zIndex = '1000';
    document.body.appendChild(container);
  }

  return createPortal(<div style={{ pointerEvents: 'auto' }}>{children}</div>, container);
};

export default FABPortal;
