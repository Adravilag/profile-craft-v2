import { useUnifiedTheme as useUnifiedThemeFromContext } from '@/contexts';
import type { UnifiedThemeContextType } from '@/contexts/UnifiedThemeContext';

// Re-export the unified theme hook from the context to keep a single source of truth
export const useUnifiedTheme: () => UnifiedThemeContextType = useUnifiedThemeFromContext;
export default useUnifiedThemeFromContext;
