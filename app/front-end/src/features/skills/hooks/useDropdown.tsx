import { useCallback, useEffect, useRef, useState } from 'react';

export const useDropdown = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuTimeoutId, setMenuTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMenuEnter = useCallback(() => {
    if (menuTimeoutId) {
      clearTimeout(menuTimeoutId);
      setMenuTimeoutId(null);
    }
    setIsMenuOpen(true);
  }, [menuTimeoutId]);

  const handleMenuLeave = useCallback(() => {
    const timeoutId = setTimeout(() => setIsMenuOpen(false), 300);
    setMenuTimeoutId(timeoutId);
  }, []);

  const handleMenuClick = useCallback(() => {
    // Toggle menu visibility
    setIsMenuOpen(prev => !prev);
  }, []);

  useEffect(() => {
    // NOTE:
    // Outside-click handling for dropdowns that render into a portal must be
    // performed by the portal-aware component (PortalDropdown) because the
    // DOM node containing the menu lives outside the local `menuRef`.
    // Keeping a document-level 'mousedown' listener here caused a race where
    // the menu was closed on mousedown (before the click handlers inside the
    // portal ran) which prevented actions like Edit from firing. The portal
    // provides a reliable 'click' listener which runs after internal handlers.
    // Therefore we intentionally omit a global outside-click listener here.
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      if (menuTimeoutId) {
        clearTimeout(menuTimeoutId);
      }
    };
  }, [menuTimeoutId]);

  return {
    menuRef,
    buttonRef,
    isMenuOpen,
    handleMenuEnter,
    handleMenuLeave,
    handleMenuClick,
    setIsMenuOpen,
  };
};

export default useDropdown;
