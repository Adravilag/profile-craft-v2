export const useNotificationContext = () => {
  return {
    showSuccess: (_title: string, _message?: string) => {},
    showError: (_title: string, _message?: string) => {},
  } as const;
};

export const useNotification = useNotificationContext;

export default useNotificationContext;
