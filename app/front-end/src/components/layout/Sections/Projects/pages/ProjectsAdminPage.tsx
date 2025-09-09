import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthGuard from '@/hooks/useAuthGuard';
import { SmartNavigation, Footer } from '@/ui';
import ProjectsAdmin from '../admin/ProjectsAdmin';
import CreateProject from '../components/forms/CreateProject';
import EditProject from '../components/forms/EditProject';
import { SectionsLoadingProvider } from '@/contexts/SectionsLoadingContext';
import styles from './ProjectsAdminPage.module.css';

const ProjectsAdminPage: React.FC = () => {
  const location = useLocation();

  const { isLoading, isAuthenticated, shouldRender, error } = useAuthGuard({
    redirectTo: '/',
    redirectDelay: 150,
    requireAuth: true,
  });
  const isNewMode = location.pathname === '/projects/new';
  const isEditMode = location.pathname.startsWith('/projects/edit/');
  const navItems = [
    { id: 'home', label: 'Inicio', icon: 'fas fa-home' },
    { id: 'about', label: 'Sobre mí', icon: 'fas fa-user' },
    { id: 'experience', label: 'Experiencia', icon: 'fas fa-briefcase' },
    { id: 'projects', label: 'Proyectos', icon: 'fas fa-project-diagram' },
    { id: 'skills', label: 'Habilidades', icon: 'fas fa-tools' },
    { id: 'certifications', label: 'Certificaciones', icon: 'fas fa-certificate' },
    { id: 'testimonials', label: 'Testimonios', icon: 'fas fa-comments' },
    { id: 'contact', label: 'Contacto', icon: 'fas fa-envelope' },
  ];

  if (isLoading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <h1>Verificando autenticación...</h1>
          <p>Por favor espera mientras verificamos tu sesión.</p>
        </div>
      </div>
    );
  }

  if (!shouldRender) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>🔒</div>
          <h1>Acceso restringido</h1>
          <p>{error || 'Necesitas estar autenticado para acceder a esta página.'}</p>
          <div className={styles.actionButtons}>
            <Link to="/" className={styles.btnPrimary}>
              Volver al portafolio
            </Link>
            <button onClick={() => window.location.reload()} className={styles.btnSecondary}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <SectionsLoadingProvider>
      <div className={styles.adminPage}>
        <SmartNavigation navItems={navItems} />
        {!isNewMode && !isEditMode && (
          <header className={styles.adminHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <Link to="/" className={styles.backButton}>
                  ← Volver
                </Link>
                <h1 className={styles.title}>Administración de Proyectos</h1>
              </div>
              <div className={styles.headerRight}>
                <div
                  className={styles.themeToggle}
                  title="Modo oscuro activo"
                  aria-label="Modo oscuro activo"
                >
                  <i className={`fas fa-moon ${styles.moonIcon}`}></i>
                  <span>Modo Oscuro</span>
                </div>
              </div>
            </div>
          </header>
        )}

        <main className={styles.adminMain}>
          {' '}
          {isNewMode ? <CreateProject /> : isEditMode ? <EditProject /> : <ProjectsAdmin />}
        </main>
        <Footer />
      </div>
    </SectionsLoadingProvider>
  );
};

export default ProjectsAdminPage;
