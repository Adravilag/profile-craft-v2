import React, { useEffect, useState, useRef } from 'react';
import { useBackendStatus } from '../../hooks/useBackendStatus';

// Icono animado de círculo girando (SVG)
const Spinner = () => (
  <svg
    width="38"
    height="38"
    viewBox="0 0 38 38"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <defs>
      <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
        <stop stopColor="#a78bfa" stopOpacity="0" />
        <stop stopColor="#a78bfa" stopOpacity=".63" offset=".63" />
        <stop stopColor="#7c3aed" offset="1" />
      </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd">
      <g transform="translate(1 1)">
        <path
          d="M18 36C27.9411 36 36 27.9411 36 18"
          stroke="url(#a)"
          strokeWidth="3.5"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 18"
            to="360 18 18"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
        <circle fill="#a78bfa" cx="18" cy="2.5" r="2.5">
          <animate attributeName="opacity" values="1;.5;1" dur="1s" repeatCount="indefinite" />
        </circle>
      </g>
    </g>
  </svg>
);

const BackendLoadingScreen: React.FC = () => {
  const { isOnline, isChecking } = useBackendStatus();
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Barra avanza hasta 98% en 60 segundos (0.0167% por frame a 60fps aprox)
    const DURATION = 60000; // 60 segundos
    const MAX_PROGRESS = 98;
    const start = Date.now();
    const tick = () => {
      setProgress(prev => {
        if (isOnline) return 100;
        const elapsed = Date.now() - start;
        const next = Math.min((elapsed / DURATION) * MAX_PROGRESS, MAX_PROGRESS);
        // Si el usuario recarga, prev puede ser mayor por isOnline, así que protegemos:
        return Math.max(prev, next);
      });
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline) return;
    let id: number | null = null;
    const step = () => {
      setProgress(prev => Math.min(100, prev + Math.max(2, (100 - prev) * 0.25)));
      id = window.setTimeout(() => {
        // noop; the next step will be scheduled until progress reaches 100
      }, 80);
    };
    step();
    return () => {
      if (id) clearTimeout(id);
    };
  }, [isOnline]);

  const percentText = Math.floor(progress);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #0f1115 0%, #1b1f26 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        fontFamily: 'Poppins, Inter, Roboto, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
          borderRadius: 20,
          padding: '2.5rem 2rem',
          minWidth: 320,
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 8px 36px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.04)',
          transition: 'box-shadow 0.3s',
        }}
      >
        <div style={{ width: '100%', marginBottom: 18 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Spinner />
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#fff',
                marginTop: 16,
                letterSpacing: 0.2,
              }}
            >
              Cargando servicios…
            </div>
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentText}
            style={{
              height: 14,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.04)',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.03)',
              boxShadow: '0 0 16px 2px #a78bfa33',
              position: 'relative',
              marginBottom: 2,
            }}
          >
            <div
              style={{
                width: `${percentText}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 60%, #a78bfa 100%)',
                borderRadius: 999,
                transition: 'width 220ms cubic-bezier(.4,1.6,.6,1)',
                boxShadow: '0 0 16px 2px #a78bfa99, 0 6px 18px rgba(124,58,237,0.16) inset',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Efecto brillo animado */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: '100%',
                  pointerEvents: 'none',
                  background:
                    'linear-gradient(120deg, transparent 60%, #fff8 80%, transparent 100%)',
                  filter: 'blur(2px)',
                  animation: 'shine 1.2s linear infinite',
                  opacity: 0.7,
                }}
              />
              <style>{`
                @keyframes shine {
                  0% { transform: translateX(-80%); }
                  100% { transform: translateX(120%); }
                }
                div[role="progressbar"] > div > div {
                  animation: shine 1.2s linear infinite;
                }
              `}</style>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              color: '#bfc0d6',
              fontSize: 14,
            }}
          >
            <span>{isChecking ? 'Comprobando servicios...' : 'Estado de los servicios'}</span>
            <span style={{ color: '#e9d5ff', fontWeight: 700, fontSize: 15 }}>{percentText}%</span>
          </div>
          <p
            style={{
              maxWidth: 360,
              textAlign: 'center',
              fontSize: 14,
              color: '#aeb0c6',
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            Estamos poniendo en marcha los servicios necesarios para mostrar el contenido del
            portfolio. Esto suele tardar unos segundos.
            <br />
            Gracias por la paciencia — si tarda mucho, puedes actualizar la página.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackendLoadingScreen;
