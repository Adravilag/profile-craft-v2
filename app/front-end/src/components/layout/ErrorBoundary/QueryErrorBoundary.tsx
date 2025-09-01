// src/components/layout/ErrorBoundary/QueryErrorBoundary.tsx
import { Component, type ErrorInfo, type PropsWithChildren } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

export class QueryErrorBoundary extends Component<PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Query Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <div role="alert">
              <h2>Algo salió mal</h2>
              <button
                onClick={() => {
                  reset(); // 🔑 resetea errores de React Query
                  this.setState({ hasError: false });
                }}
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </QueryErrorResetBoundary>
      );
    }

    return this.props.children;
  }
}
