import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

// 1. Crear el contexto para el estado del dropdown
interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSelect?: (option: any) => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown.* components must be rendered within a Dropdown component.');
  }
  return context;
};

interface DropdownProps {
  children: React.ReactNode;
}

/**
 * Componente raíz del Dropdown. Mantiene el estado de apertura/cierre.
 */
export const Dropdown = ({ children }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const providerValue = React.useMemo(() => ({ isOpen, setIsOpen }), [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <DropdownContext.Provider value={providerValue}>{children}</DropdownContext.Provider>
    </div>
  );
};

interface DropdownTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

/**
 * El botón que activa el dropdown.
 */
const DropdownTrigger = ({ children }: DropdownTriggerProps) => {
  const { isOpen, setIsOpen } = useDropdownContext();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // El `asChild` es una convención para pasar las props al primer hijo.
  // Aquí lo implementamos de forma simplificada.
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: toggleDropdown,
      'aria-expanded': isOpen,
      'aria-haspopup': 'true',
      ref: buttonRef,
    } as any);
  }

  return (
    <button onClick={toggleDropdown} aria-expanded={isOpen} aria-haspopup="true" ref={buttonRef}>
      {children}
    </button>
  );
};

interface DropdownContentProps {
  children: React.ReactNode;
  align?: 'start' | 'end';
}

/**
 * El contenedor del menú. Solo se renderiza si el dropdown está abierto.
 */
const DropdownContent = ({ children, align = 'start' }: DropdownContentProps) => {
  const { isOpen, setIsOpen } = useDropdownContext();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      // Lógica de navegación con teclado se puede añadir aquí
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      menuRef.current?.focus();
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`absolute z-10 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none 
      ${align === 'end' ? 'right-0' : 'left-0'}`}
      role="menu"
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Un elemento del menú.
 */
const DropdownItem = ({ children, onClick, className }: DropdownItemProps) => {
  const { setIsOpen } = useDropdownContext();
  const handleClick = () => {
    if (onClick) onClick();
    setIsOpen(false);
  };

  return (
    <button
      onClick={handleClick}
      role="menuitem"
      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  );
};

// 2. Exportar los subcomponentes
Dropdown.Trigger = DropdownTrigger;
Dropdown.Content = DropdownContent;
Dropdown.Item = DropdownItem;
