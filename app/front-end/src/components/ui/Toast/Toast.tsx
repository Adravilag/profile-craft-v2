// components/ui/Toast.tsx
import { useRef, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss: () => void;
}

export function AccessibleToast({ message, type, onDismiss }: ToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-dismiss después de 5 segundos
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getAriaLive = () => {
    return type === 'error' ? 'assertive' : 'polite';
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live={getAriaLive()}
      aria-atomic="true"
      tabIndex={-1}
      className={`
        toast toast-${type}
        flex items-center gap-3 p-4 rounded-lg shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500
      `}
    >
      <span aria-hidden="true" className="text-lg">
        {getIcon()}
      </span>

      <span className="flex-1">{message}</span>

      <button
        onClick={onDismiss}
        className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
        aria-label={`Cerrar notificación: ${message}`}
      >
        ×
      </button>
    </div>
  );
}
