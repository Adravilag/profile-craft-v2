import React from 'react';

const BackendLoadingScreen: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #181c24 0%, #23272f 100%)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      fontFamily: 'Roboto, Inter, system-ui, sans-serif',
      transition: 'background 0.3s',
    }}
  >
    <div
      style={{
        background: 'rgba(33, 37, 41, 0.92)',
        borderRadius: 24,
        boxShadow: '0 6px 32px 0 rgba(0,0,0,0.32)',
        padding: '2.5rem 2rem 2rem 2rem',
        minWidth: 340,
        maxWidth: 380,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1.5px solid #23272f',
        gap: 18,
      }}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        style={{ marginBottom: 8, filter: 'drop-shadow(0 0 8px #7c3aed88)' }}
      >
        <circle cx="12" cy="12" r="10" stroke="#7c3aed" strokeWidth="2.5" strokeOpacity="0.18" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <h2
        style={{
          fontSize: '1.45rem',
          fontWeight: 700,
          letterSpacing: 0.1,
          margin: 0,
          color: '#fff',
          textShadow: '0 2px 12px #0008',
        }}
      >
        El backend está arrancando…
      </h2>
      <p
        style={{
          maxWidth: 320,
          textAlign: 'center',
          fontSize: 16,
          color: '#c7c9d1',
          margin: 0,
          lineHeight: 1.6,
          fontWeight: 400,
        }}
      >
        El servidor backend está inactivo o en proceso de arranque (por ejemplo, en Render).
        <br />
        Esto puede tardar unos segundos la primera vez.
        <br />
        <br />
        <span style={{ color: '#b39ddb', fontWeight: 500 }}>Por favor, espera…</span>
      </p>
    </div>
  </div>
);

export default BackendLoadingScreen;
