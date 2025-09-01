// src/App.tsx
import '@/index.css';
import { AppProviders } from './providers/providers';
import { Router } from './router/router';
import { QueryErrorBoundary } from '@components/layout/ErrorBoundary/QueryErrorBoundary';

export function App() {
  return (
    <AppProviders>
      <QueryErrorBoundary>
        <Router />
      </QueryErrorBoundary>
    </AppProviders>
  );
}
