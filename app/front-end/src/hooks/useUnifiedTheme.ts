import { useUnifiedTheme as useUnifiedThemeFromContext } from '@/contexts';

// Re-export the unified theme hook from the context to keep a single source of truth
export const useUnifiedTheme = useUnifiedThemeFromContext;
export default useUnifiedThemeFromContext;
