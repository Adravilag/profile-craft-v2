import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Notification } from '@/hooks/useNotification';
// NotificationComponent will be imported from UI package when using this context

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    type: Notification['type'],
    title: string,
    message?: string,
    duration?: number,
    options?: NotificationOptions
  ) => string;
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  showWarning: (title: string, message?: string, duration?: number) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  maxNotifications: number;
  setMaxNotifications: (max: number) => void;
}

interface NotificationOptions {
  persistent?: boolean;
  priority?: 'high' | 'normal' | 'low';
  category?: string;
}

interface ExtendedNotification extends Notification {
  persistent?: boolean;
  priority?: 'high' | 'normal' | 'low';
  category?: string;
  timestamp: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications: initialMax = 5,
}) => {
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [maxNotifications, setMaxNotifications] = useState(initialMax);

  // Función para ordenar notificaciones por prioridad
  const sortNotificationsByPriority = (notifications: ExtendedNotification[]) => {
    return [...notifications].sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'normal'];
      const bPriority = priorityOrder[b.priority || 'normal'];

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      // Si tienen la misma prioridad, ordenar por timestamp (más reciente primero)
      return b.timestamp - a.timestamp;
    });
  };

  // Función para gestionar la cola de notificaciones
  const manageNotificationQueue = useCallback(
    (newNotifications: ExtendedNotification[]) => {
      const sorted = sortNotificationsByPriority(newNotifications);

      // Separar notificaciones persistentes y normales
      const persistent = sorted.filter(n => n.persistent);
      const normal = sorted.filter(n => !n.persistent);

      // Mantener todas las persistentes + las normales hasta el límite
      const availableSlots = Math.max(0, maxNotifications - persistent.length);
      const finalNotifications = [...persistent, ...normal.slice(0, availableSlots)];

      return finalNotifications;
    },
    [maxNotifications]
  );

  const showNotification = useCallback(
    (
      type: Notification['type'],
      title: string,
      message?: string,
      duration: number = 5000,
      options: NotificationOptions = {}
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const notification: ExtendedNotification = {
        id,
        type,
        title,
        message,
        duration: options.persistent ? 0 : duration,
        persistent: options.persistent,
        priority: options.priority || 'normal',
        category: options.category,
        timestamp: Date.now(),
      };

      setNotifications(prev => {
        const updated = [...prev, notification];
        return manageNotificationQueue(updated);
      });

      // Auto remove notification si no es persistente
      if (!options.persistent && duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [manageNotificationQueue]
  );

  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showNotification('success', title, message, duration);
    },
    [showNotification]
  );

  const showError = useCallback(
    (title: string, message?: string, duration: number = 8000) => {
      return showNotification('error', title, message, duration, { priority: 'high' });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (title: string, message?: string, duration: number = 6000) => {
      return showNotification('warning', title, message, duration, { priority: 'high' });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showNotification('info', title, message, duration);
    },
    [showNotification]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Efecto para gestionar cambios en el límite máximo
  useEffect(() => {
    setNotifications(prev => manageNotificationQueue(prev));
  }, [maxNotifications, manageNotificationQueue]);

  // Detectar si hay demasiadas notificaciones del mismo tipo
  useEffect(() => {
    const typeCount = notifications.reduce(
      (acc, notif) => {
        acc[notif.type] = (acc[notif.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Si hay más de 3 notificaciones del mismo tipo, mostrar un resumen
    Object.entries(typeCount).forEach(([type, count]) => {
      if (count > 3) {
        const sameTypeNotifications = notifications.filter(n => n.type === type);
        const oldest = sameTypeNotifications.slice(0, -2); // Mantener las 2 más recientes

        oldest.forEach(notif => removeNotification(notif.id));

        // Mostrar notificación de resumen
        if (count > 3) {
          showNotification(
            'info',
            `${count - 2} notificaciones más de ${type}`,
            'Se han agrupado notificaciones similares para mejor experiencia',
            3000,
            { priority: 'low', category: 'summary' }
          );
        }
      }
    });
  }, [notifications, showNotification, removeNotification]);

  const value = {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications,
    maxNotifications,
    setMaxNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* NotificationComponent should be rendered by the consuming app */}
    </NotificationContext.Provider>
  );
};
