// src/components/ui/LoadingSpinner/LoadingSpinner.demo.tsx
import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import type { CSSProperties } from 'react';

const demoContainerStyle: CSSProperties = {
  padding: '2rem',
  fontFamily: 'var(--font-sans)',
  lineHeight: 1.6,
  maxWidth: '1200px',
  margin: '0 auto',
};

const sectionStyle: CSSProperties = {
  marginBottom: '3rem',
  padding: '2rem',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--border-primary)',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '2rem',
  marginTop: '1rem',
};

const cardStyle: CSSProperties = {
  padding: '1.5rem',
  backgroundColor: 'var(--bg-primary)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-secondary)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

export function LoadingSpinnerDemo() {
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Auto-hide full screen demo after 3 seconds
  useEffect(() => {
    if (showFullScreen) {
      const timer = setTimeout(() => {
        setShowFullScreen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showFullScreen]);

  return (
    <div style={demoContainerStyle}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>
        🔄 LoadingSpinner - Diseño Mejorado
      </h1>

      {/* Variantes */}
      <section style={sectionStyle}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          🎨 Variantes Visuales
        </h2>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <LoadingSpinner variant="default" size="large" />
            <h3>Default</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Spinner clásico con animación suavizada
            </p>
          </div>

          <div style={cardStyle}>
            <LoadingSpinner variant="pulse" size="large" />
            <h3>Pulse</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Con efecto de pulsación para mayor atención
            </p>
          </div>

          <div style={cardStyle}>
            <LoadingSpinner variant="gradient" size="large" />
            <h3>Gradient</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Con gradiente de colores dinámico
            </p>
          </div>

          <div style={cardStyle}>
            <LoadingSpinner variant="dots" size="large" />
            <h3>Dots</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Con puntos orbitales animados
            </p>
          </div>
        </div>
      </section>

      {/* Tamaños */}
      <section style={sectionStyle}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          📏 Tamaños Disponibles
        </h2>
        <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div style={cardStyle}>
            <LoadingSpinner size="small" variant="pulse" />
            <span style={{ fontSize: '0.875rem' }}>Small (16px)</span>
          </div>

          <div style={cardStyle}>
            <LoadingSpinner size="medium" variant="pulse" />
            <span style={{ fontSize: '0.875rem' }}>Medium (24px)</span>
          </div>

          <div style={cardStyle}>
            <LoadingSpinner size="large" variant="pulse" />
            <span style={{ fontSize: '0.875rem' }}>Large (48px)</span>
          </div>

          <div style={cardStyle}>
            <LoadingSpinner size="xlarge" variant="pulse" />
            <span style={{ fontSize: '0.875rem' }}>XLarge (64px)</span>
          </div>
        </div>
      </section>

      {/* Colores Personalizados */}
      <section style={sectionStyle}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          🌈 Colores Personalizados
        </h2>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <LoadingSpinner size="large" color="#ff6b6b" variant="gradient" />
            <span>Rojo Coral</span>
          </div>

          <div style={cardStyle}>
            <LoadingSpinner size="large" color="#4ecdc4" variant="pulse" />
            <span>Turquesa</span>
          </div>

          <div style={cardStyle}>
            <LoadingSpinner size="large" color="#45b7d1" variant="default" />
            <span>Azul Cielo</span>
          </div>

          <div style={cardStyle}>
            <LoadingSpinner size="large" color="#feca57" variant="dots" />
            <span>Amarillo Dorado</span>
          </div>
        </div>
      </section>

      {/* Contextos de Uso */}
      <section style={sectionStyle}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>💼 Contextos de Uso</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* En línea con texto */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <LoadingSpinner size="small" />
            <span>Cargando datos del usuario...</span>
          </div>

          {/* Con texto como children */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '2rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <LoadingSpinner size="medium" variant="gradient">
              Sincronizando con el servidor...
            </LoadingSpinner>
          </div>

          {/* En botón */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'not-allowed',
              opacity: 0.8,
            }}
            disabled
          >
            <LoadingSpinner size="small" color="white" />
            Procesando...
          </button>
        </div>
      </section>

      {/* Full Screen Demo */}
      <section style={sectionStyle}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>🖥️ Pantalla Completa</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          El spinner puede mostrarse como overlay de pantalla completa con efectos visuales
          mejorados.
        </p>

        <button
          onClick={() => setShowFullScreen(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          🚀 Mostrar Full Screen (3s)
        </button>

        {showFullScreen && (
          <LoadingSpinner fullScreen size="xlarge" variant="gradient">
            Cargando aplicación...
          </LoadingSpinner>
        )}
      </section>

      {/* Características */}
      <section style={sectionStyle}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          ✨ Características Mejoradas
        </h2>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <span style={{ fontSize: '2rem' }}>🎯</span>
            <h3>Accesibilidad</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              ARIA labels, soporte para lectores de pantalla y reduced motion
            </p>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '2rem' }}>⚡</span>
            <h3>Performance</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Animaciones optimizadas con hardware acceleration
            </p>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '2rem' }}>🎨</span>
            <h3>Personalizable</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Múltiples variantes, tamaños y colores
            </p>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '2rem' }}>📱</span>
            <h3>Responsive</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Se adapta perfectamente a todos los dispositivos
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoadingSpinnerDemo;
