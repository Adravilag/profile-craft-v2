import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

type PortalDropdownProps = {
  anchorRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

// Custom Hook para detectar clics fuera de un elemento
const useClickOutside = (ref: React.RefObject<HTMLElement | null>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};

const PortalDropdown: React.FC<PortalDropdownProps> = ({
  anchorRef,
  isOpen,
  onClose,
  children,
}) => {
  const portalRootRef = useRef<HTMLDivElement | null>(null);
  const portalContentRef = useRef<HTMLDivElement | null>(null);

  // Crear y limpiar el nodo del portal en el DOM
  useEffect(() => {
    const portalRoot = document.createElement('div');
    portalRoot.className = 'pc-skill-portal';
    portalRoot.style.position = 'fixed';
    portalRoot.style.top = '0';
    portalRoot.style.left = '0';
    portalRoot.style.zIndex = '9999';
    document.body.appendChild(portalRoot);
    portalRootRef.current = portalRoot;

    return () => {
      if (portalRoot.parentNode) {
        portalRoot.parentNode.removeChild(portalRoot);
      }
      portalRootRef.current = null;
    };
  }, []);

  // Lógica de posicionamiento
  const position = useCallback(() => {
    if (!isOpen || !portalRootRef.current || !anchorRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const portalEl = portalRootRef.current;
    const menuEl = portalContentRef.current;

    if (!menuEl) return;

    const menuW = menuEl.offsetWidth;
    const menuH = menuEl.offsetHeight;

    let left = anchorRect.right + 8;
    if (left + menuW + 8 > window.innerWidth) {
      left = Math.max(8, anchorRect.left - menuW - 8);
    }

    const yOffset = 60;
    let top = anchorRect.top + anchorRect.height / 2 - menuH / 2 + yOffset;
    top = Math.max(8, Math.min(top, window.innerHeight - menuH - 8));

    portalEl.style.left = `${Math.round(left)}px`;
    portalEl.style.top = `${Math.round(top)}px`;
  }, [isOpen, anchorRef]);

  // Observar el contenido para posicionar
  useLayoutEffect(() => {
    if (!isOpen || !portalContentRef.current) return;

    const observer = new MutationObserver(position);
    observer.observe(portalContentRef.current, { childList: true, subtree: true });

    position();

    return () => observer.disconnect();
  }, [isOpen, position]);

  // Escuchar eventos de redimensionamiento y scroll
  useLayoutEffect(() => {
    if (!isOpen) return;

    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);

    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [isOpen, position]);

  // Manejar clic fuera del portal
  useClickOutside(portalContentRef, () => {
    if (isOpen && !anchorRef.current?.contains(event.target as Node)) {
      onClose();
    }
  });

  if (!portalRootRef.current) return null;

  return isOpen
    ? createPortal(
        <div ref={portalContentRef} style={{ pointerEvents: 'auto' }}>
          {children}
        </div>,
        portalRootRef.current
      )
    : null;
};

export default PortalDropdown;
