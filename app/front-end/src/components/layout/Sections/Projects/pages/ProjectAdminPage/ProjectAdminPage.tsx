import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthGuard from '@/hooks/useAuthGuard';
import { SmartNavigation, Footer } from '@/ui';
import ProjectsAdmin from '../../admin/ProjectsAdmin';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import styles from './ProjectAdminPage.module.css';

const ProjectAdminPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Usar el hook useAuthGuard para manejar la autenticación de manera robusta
  const { isLoading, shouldRender, error } = useAuthGuard({
    redirectTo: '/',
    redirectDelay: 150,
    requireAuth: true,
  });

  // Detectar el modo según la URL
  const isNewMode = location.pathname === '/projects/new';
  const isEditMode = location.pathname.startsWith('/projects/edit/');

  // Extraer projectId de la URL para modo edición
  const projectId = isEditMode ? location.pathname.split('/').pop() : undefined;

  // Callbacks para ProjectForm
  const handleSuccess = () => {
    // Navegar de vuelta a la administración después de éxito
    navigate('/projects/admin');
  };

  const handleCancel = () => {
    // Navegar de vuelta a la administración al cancelar
    navigate('/projects/admin');
  };
  // Items de navegación para SmartNavigation
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

  // Mostrar loading mientras se verifica la autenticación
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

  return (
    <div className={styles.adminPage}>
      {/* Navegación inteligente */}
      <SmartNavigation navItems={navItems} /> {/* Contenido principal */}
      <main className={styles.adminMain}>
        {isNewMode ? (
          <ProjectForm mode="create" onSuccess={handleSuccess} onCancel={handleCancel} />
        ) : isEditMode ? (
          <ProjectForm
            mode="edit"
            projectId={projectId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <ProjectsAdmin />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProjectAdminPage;
