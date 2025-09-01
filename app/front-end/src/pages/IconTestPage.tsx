// Página temporal para probar el sistema de iconos después de la limpieza SVG
import React from 'react';
import { SkillsTestComponent } from '@/features/skills';

const IconTestPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ color: '#1f2937', marginBottom: '10px' }}>
            🧪 Test de Sistema de Iconos - Post Limpieza
          </h1>
          <p style={{ color: '#6b7280' }}>
            Verificando que todos los iconos se cargan correctamente después de renombrar y eliminar
            duplicados
          </p>
        </header>

        <SkillsTestComponent />

        <footer
          style={{ marginTop: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}
        >
          <p>
            Esta página es temporal y se puede eliminar después de verificar que todo funciona ✅
          </p>
        </footer>
      </div>
    </div>
  );
};

export default IconTestPage;
