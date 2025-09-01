import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

interface ModalPortalProps {
  children: React.ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Guardar el overflow original del body
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalHeight = document.body.style.height;

    const portalContainer = document.createElement('div');
    portalContainer.className = styles.modalPortalContainer || '';
    document.body.appendChild(portalContainer);

    // Bloquear scroll de manera más agresiva
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.classList.add(styles.scrollLock || '');

    // También prevenir scroll en el documento
    document.documentElement.style.overflow = 'hidden';

    setContainer(portalContainer);

    return () => {
      if (portalContainer && document.body.contains(portalContainer)) {
        document.body.removeChild(portalContainer);
      }

      // Restaurar estilos originales
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.height = originalHeight;
      document.body.style.width = '';
      document.body.classList.remove(styles.scrollLock || '');
      document.documentElement.style.overflow = '';
    };
  }, []);

  if (!container) return null;
  return createPortal(children, container);
};

export default ModalPortal;
