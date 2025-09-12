import React from 'react';
import { useRouteError } from 'react-router-dom';

const RouteError: React.FC = () => {
  const error = useRouteError() as any;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }} role="alert">
      <h1 style={{ marginTop: 0 }}>Error cargando la página</h1>
      <p>Hubo un problema al cargar esta sección. Puedes recargar para intentar de nuevo.</p>
      {error && (
        <pre style={{ background: '#f8f8f8', padding: 12, borderRadius: 6, overflow: 'auto' }}>
          {String(error?.message ?? error)}
        </pre>
      )}
      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}
        >
          Recargar
        </button>
      </div>
    </div>
  );
};

export default RouteError;
