import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type PortalDropdownProps = {
  anchorRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const PortalDropdown: React.FC<PortalDropdownProps> = ({
  anchorRef,
  isOpen,
  onClose,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = document.createElement('div');
    el.className = 'pc-skill-portal';
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.zIndex = '9999';
    document.body.appendChild(el);
    containerRef.current = el;
    setMounted(true);
    return () => {
      try {
        if (el.parentNode) el.parentNode.removeChild(el);
      } catch (e) {
        // ignore
      }
      containerRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const anchor = anchorRef?.current;
    if (!anchor) return;

    const position = () => {
      const rect = anchor.getBoundingClientRect();
      const portal = containerRef.current!;
      // assume the menu is the first child
      const menuEl = portal.firstElementChild as HTMLElement | null;

      const doPosition = () => {
        const menuW = menuEl ? menuEl.offsetWidth : 220;
        const menuH = menuEl ? menuEl.offsetHeight : 120;

        let left = rect.right + 8; // to the right
        // flip if overflowing to the right
        if (left + menuW + 8 > window.innerWidth) {
          left = Math.max(8, rect.left - 8 - menuW);
        }

        // center vertically around the anchor, but add a small downward offset
        const yOffset = 60; // nudge down to avoid overlapping rounded corners
        let top = rect.top + rect.height / 2 - menuH / 2 + yOffset;
        top = Math.max(8, Math.min(top, window.innerHeight - menuH - 8));

        portal.style.left = `${Math.round(left)}px`;
        portal.style.top = `${Math.round(top)}px`;
      };

      // If the menu hasn't rendered size yet, try to measure after paint
      if (!menuEl || menuEl.offsetHeight === 0) {
        let tries = 0;
        const tryMeasure = () => {
          tries += 1;
          if (menuEl && menuEl.offsetHeight > 0) {
            doPosition();
          } else if (tries < 6) {
            requestAnimationFrame(tryMeasure);
          } else {
            // fallback
            doPosition();
          }
        };
        requestAnimationFrame(tryMeasure);
      } else {
        doPosition();
      }
    };

    position();

    const onResize = () => position();
    const onScroll = () => position();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (ev: MouseEvent) => {
      const portal = containerRef.current;
      const target = ev.target as Node | null;
      const anchor = anchorRef?.current;
      if (portal && !portal.contains(target) && anchor && !anchor.contains(target)) {
        onClose();
      }
    };
    // Use 'click' so internal onClick handlers run before we evaluate outside clicks
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!mounted || !containerRef.current) return null;
  return isOpen
    ? createPortal(<div style={{ pointerEvents: 'auto' }}>{children}</div>, containerRef.current)
    : null;
};

export default PortalDropdown;
