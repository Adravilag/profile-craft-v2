// src/App.tsx

import '@/index.css';
import { AppProviders } from './providers/providers';
import { Router } from './router/router';
import { QueryErrorBoundary } from '@components/layout/ErrorBoundary/QueryErrorBoundary';
import BackendStatusGate from '../pages/BackendLoadingPage/BackendStatusGate';

export function App() {
  return (
    <AppProviders>
      <BackendStatusGate>
        <QueryErrorBoundary>
          <Router />
        </QueryErrorBoundary>
      </BackendStatusGate>
    </AppProviders>
  );
}
