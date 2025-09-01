export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useNotificationContext = () => {
  return {
    showSuccess: (_title: string, _message?: string) => {},
    showError: (_title: string, _message?: string) => {},
  } as const;
};

export const useNotification = useNotificationContext;

export default useNotificationContext;
