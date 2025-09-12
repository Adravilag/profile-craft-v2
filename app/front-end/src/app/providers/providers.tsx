import { lazy, Suspense, type PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient as defaultClient } from '@services/react-query/queryClient';
import {
  AuthProvider,
  DataProvider,
  NotificationProvider,
  UnifiedThemeProvider,
  TranslationProvider,
} from '@/contexts';
import { SectionsLoadingProvider } from '@/contexts/SectionsLoadingContext';

// Control de activación de React Query vía variable de entorno Vite
// Para habilitar: VITE_ENABLE_REACT_QUERY=true
const REACT_QUERY_ENABLED = import.meta.env.VITE_ENABLE_REACT_QUERY === 'true';

// Carga perezosa del Devtools solo en desarrollo y si React Query está activado
const Devtools =
  REACT_QUERY_ENABLED && import.meta.env.DEV
    ? lazy(() =>
        import('@tanstack/react-query-devtools').then(m => ({
          default: m.ReactQueryDevtools,
        }))
      )
    : null;

type AppProvidersProps = PropsWithChildren<{
  client?: typeof defaultClient; // permite inyectar otro QueryClient en tests
}>;

export function AppProviders({ children, client = defaultClient }: AppProvidersProps) {
  // Si React Query está deshabilitado, devolvemos los providers restantes sin QueryClientProvider
  if (!REACT_QUERY_ENABLED) {
    return (
      <>
        <TranslationProvider>
          <NotificationProvider>
            <AuthProvider>
              <UnifiedThemeProvider>
                <SectionsLoadingProvider>
                  <DataProvider>{children}</DataProvider>
                </SectionsLoadingProvider>
              </UnifiedThemeProvider>
            </AuthProvider>
          </NotificationProvider>
        </TranslationProvider>
      </>
    );
  }

  return (
    <QueryClientProvider client={client}>
      <TranslationProvider>
        <NotificationProvider>
          <AuthProvider>
            <UnifiedThemeProvider>
              <SectionsLoadingProvider>
                <DataProvider>{children}</DataProvider>
              </SectionsLoadingProvider>
            </UnifiedThemeProvider>
          </AuthProvider>
        </NotificationProvider>
      </TranslationProvider>
      {import.meta.env.DEV && Devtools && (
        <Suspense fallback={null}>
          <Devtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
