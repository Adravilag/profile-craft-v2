import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

type PortalDropdownProps = {
  anchorRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  /** Optional mouse Y coordinate to position the portal vertically around the pointer */
  mouseY?: number | null;
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
  mouseY = null,
  children,
}) => {
  const portalRootRef = useRef<HTMLDivElement | null>(null);
  const portalContentRef = useRef<HTMLDivElement | null>(null);
  const isHoveringRef = useRef(false);

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
    if (isHoveringRef.current) return;

    // Throttle layout reads with rAF
    let ticking = (position as any).__ticking as boolean | undefined;
    if (ticking) return;
    (position as any).__ticking = true;

    requestAnimationFrame(() => {
      try {
        const anchorRect = anchorRef.current!.getBoundingClientRect();
        const portalEl = portalRootRef.current!;
        const menuEl = portalContentRef.current;

        if (!menuEl) return;

        const menuW = menuEl.offsetWidth;
        const menuH = menuEl.offsetHeight;

        let left = anchorRect.right + 8;
        if (left + menuW + 8 > window.innerWidth) {
          left = Math.max(8, anchorRect.left - menuW - 8);
        }

        let top: number;
        if (typeof mouseY === 'number' && Number.isFinite(mouseY)) {
          top = mouseY - menuH / 2;
        } else {
          const yOffset = 60;
          top = anchorRect.top + anchorRect.height / 2 - menuH / 2 + yOffset;
        }
        top = Math.max(8, Math.min(top, window.innerHeight - menuH - 8));

        portalEl.style.left = `${Math.round(left)}px`;
        portalEl.style.top = `${Math.round(top)}px`;
      } finally {
        (position as any).__ticking = false;
      }
    });
  }, [isOpen, anchorRef, mouseY]);

  // Observar el contenido para posicionar
  useLayoutEffect(() => {
    if (!isOpen || !portalContentRef.current) return;

    const observer = new MutationObserver(() => {
      // Only trigger position when not hovering
      if (!isHoveringRef.current) position();
    });
    observer.observe(portalContentRef.current, { childList: true, subtree: true });

    // Attach hover listeners to avoid repositioning while interacting
    const el = portalContentRef.current;
    const handleMouseEnter = () => {
      isHoveringRef.current = true;
    };
    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      position();
    };
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    position();

    return () => {
      observer.disconnect();
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isOpen, position]);

  // Escuchar eventos de redimensionamiento y scroll
  useLayoutEffect(() => {
    if (!isOpen) return;

    window.addEventListener('resize', position, { passive: true });
    window.addEventListener('scroll', position, { passive: true, capture: true });

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
