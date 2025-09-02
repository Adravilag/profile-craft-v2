// src/components/sections/experience/ExperienceManagement.tsx

import React, { useState, useEffect } from 'react';
import type { Experience } from '@/types/api';
import { experiences as experiencesApi, education as educationApi } from '@/services/endpoints';
const { getExperiences, deleteExperience } = experiencesApi;
const { getEducation, deleteEducation } = educationApi;
import { useNotification } from '@/hooks/useNotification';
import { formatDateRange } from '@/utils/dateUtils';
import ModalShell from '@/components/ui/Modal/ModalShell';
import ExperienceAdmin from './ExperienceAdmin';
import styles from './ExperienceAdmin.module.css';

interface Education {
  _id?: string;
  id?: number | string;
  title: string;
  institution: string;
  header_image?: string;
  logo_image?: string;
  start_date: string;
  end_date: string;
  description?: string;
  grade?: string;
  order_index?: number;
}

interface ExperienceManagementProps {
  onClose: () => void;
}

const ExperienceManagement: React.FC<ExperienceManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'experience' | 'education'>('experience');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const { showSuccess, showError } = useNotification();

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await getExperiences();
      setExperiences(data);
    } catch (error) {
      console.error('Error cargando experiencias:', error);
      showError('Error', 'No se pudieron cargar las experiencias');
    } finally {
      setLoading(false);
    }
  };

  const loadEducation = async () => {
    try {
      setLoading(true);
      const data = await getEducation();
      setEducation(data);
    } catch (error) {
      console.error('Error cargando educación:', error);
      showError('Error', 'No se pudo cargar la información de educación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
    loadEducation();
  }, []);

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setEditingEducation(null);
    setShowAdmin(true);
  };

  const handleEditEducation = (edu: Education) => {
    setEditingEducation(edu);
    setEditingExperience(null);
    setShowAdmin(true);
  };

  const handleNewItem = (type: 'experience' | 'education') => {
    if (type === 'experience') {
      setEditingExperience(null);
      setEditingEducation(null);
    } else {
      setEditingEducation(null);
      setEditingExperience(null);
    }
    setActiveTab(type);
    setShowAdmin(true);
  };

  const handleDeleteExperience = async (id: string, title: string) => {
    if (!id) {
      showError('Error', 'ID de experiencia no válido');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la experiencia "${title}"?`)) {
      return;
    }

    try {
      await deleteExperience(id);
      showSuccess('Experiencia eliminada', 'La experiencia se ha eliminado correctamente');
      await loadExperiences();
    } catch (error) {
      console.error('Error eliminando experiencia:', error);
      showError('Error', 'No se pudo eliminar la experiencia');
    }
  };

  const handleDeleteEducation = async (id: string | undefined, title: string) => {
    if (!id) {
      showError('Error', 'ID de educación no válido');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la educación "${title}"?`)) {
      return;
    }

    try {
      await deleteEducation(id);
      showSuccess('Educación eliminada', 'La educación se ha eliminado correctamente');
      await loadEducation();
    } catch (error) {
      console.error('Error eliminando educación:', error);
      showError('Error', 'No se pudo eliminar la educación');
    }
  };

  const handleCloseAdmin = () => {
    setShowAdmin(false);
    setEditingExperience(null);
    setEditingEducation(null);
    // Recargar datos después de la edición
    loadExperiences();
    loadEducation();
  };

  // Función para convertir fecha "Mes Año" a número para ordenamiento
  const parseDate = (dateString: string | null | undefined): number => {
    if (!dateString || dateString.trim() === '') {
      return 0;
    }

    if (dateString === 'Presente') {
      return new Date().getFullYear() * 12 + new Date().getMonth();
    }

    if (/^\d{4}$/.test(dateString)) {
      return parseInt(dateString) * 12;
    }

    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const parts = dateString.split(' ');
    if (parts.length >= 2) {
      const [monthStr, yearStr] = parts;
      const monthIndex = months.indexOf(monthStr);
      const year = parseInt(yearStr);

      if (monthIndex !== -1 && !isNaN(year)) {
        return year * 12 + monthIndex;
      }
    }

    const fallbackYear = parseInt(dateString);
    return !isNaN(fallbackYear) ? fallbackYear * 12 : 0;
  };

  // Botones de acción para el modal principal
  const actionButtons = [
    {
      key: 'newItem',
      label: `Nueva ${activeTab === 'experience' ? 'Experiencia' : 'Educación'}`,
      onClick: () => handleNewItem(activeTab),
      variant: 'primary' as const,
    },
  ];

  if (showAdmin) {
    return (
      <ExperienceAdmin
        type={activeTab}
        editingExperience={editingExperience}
        editingEducation={editingEducation}
        onClose={handleCloseAdmin}
      />
    );
  }

  return (
    <ModalShell
      title="Administración de Trayectoria"
      onClose={onClose}
      maxWidth={1200}
      actionButtons={actionButtons}
    >
      <div className={styles.experienceAdminOverlay}>
        <div className={styles.experienceAdminModal}>
          {/* Tabs para experiencia y educación */}
          <div className={styles.adminTabs}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'experience' ? styles.active : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              <i className="fas fa-briefcase"></i>
              Experiencia Laboral
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'education' ? styles.active : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <i className="fas fa-graduation-cap"></i>
              Formación Académica
            </button>
          </div>

          <div className={styles.adminContent}>
            {loading ? (
              <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin"></i>
                <p>Cargando datos...</p>
              </div>
            ) : (
              <>
                {/* Panel de Experiencia */}
                {activeTab === 'experience' && (
                  <>
                    {experiences.length === 0 ? (
                      <div className={styles.emptyState}>
                        <i className="fas fa-briefcase"></i>
                        <h3>No hay experiencias</h3>
                        <p>Añade la primera experiencia laboral usando el botón de arriba.</p>
                      </div>
                    ) : (
                      <div className={styles.itemsList}>
                        {experiences
                          .sort((a, b) => {
                            const dateA = parseDate(a.end_date);
                            const dateB = parseDate(b.end_date);
                            return dateB - dateA;
                          })
                          .map(experience => (
                            <div key={experience._id} className={styles.adminItemCard}>
                              <div className={styles.itemHeader}>
                                <div className={styles.itemInfo}>
                                  <h3>{experience.position}</h3>
                                  <p className={styles.company}>{experience.company}</p>
                                  <p className={styles.date}>
                                    <i className="fas fa-calendar-alt"></i>
                                    {formatDateRange(experience.start_date, experience.end_date)}
                                  </p>
                                  {experience.technologies &&
                                    experience.technologies.length > 0 && (
                                      <div className={styles.adminItemTechnologies}>
                                        <div className={styles.adminTechLabel}>
                                          <i className="fas fa-code"></i>
                                          Tecnologías usadas
                                        </div>
                                        <div className={styles.adminTechList}>
                                          {experience.technologies.map((tech, index) => (
                                            <span key={index} className={styles.adminTechTag}>
                                              {tech}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>

                              <div className={styles.itemActions}>
                                <button
                                  className={`${styles.actionBtn} ${styles.editBtn}`}
                                  onClick={() => handleEditExperience(experience)}
                                >
                                  <i className="fas fa-edit"></i>
                                  Editar
                                </button>
                                <button
                                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                  onClick={() =>
                                    handleDeleteExperience(experience._id, experience.position)
                                  }
                                >
                                  <i className="fas fa-trash"></i>
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}

                {/* Panel de Educación */}
                {activeTab === 'education' && (
                  <>
                    {education.length === 0 ? (
                      <div className={styles.emptyState}>
                        <i className="fas fa-graduation-cap"></i>
                        <h3>No hay formación académica</h3>
                        <p>Añade la primera formación académica usando el botón de arriba.</p>
                      </div>
                    ) : (
                      <div className={styles.itemsList}>
                        {education.map(edu => (
                          <div key={edu._id || edu.id} className={styles.adminItemCard}>
                            <div className={styles.itemHeader}>
                              <div className={styles.itemInfo}>
                                <h3>{edu.title}</h3>
                                <p className={styles.institution}>{edu.institution}</p>
                                <p className={styles.date}>
                                  <i className="fas fa-calendar-alt"></i>
                                  {formatDateRange(edu.start_date, edu.end_date)}
                                </p>
                                {edu.grade && (
                                  <p className={styles.grade}>
                                    <i className="fas fa-medal"></i>
                                    {edu.grade}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className={styles.itemActions}>
                              <button
                                className={`${styles.actionBtn} ${styles.editBtn}`}
                                onClick={() => handleEditEducation(edu)}
                              >
                                <i className="fas fa-edit"></i>
                                Editar
                              </button>
                              <button
                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                onClick={() => handleDeleteEducation(edu._id, edu.title)}
                              >
                                <i className="fas fa-trash"></i>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default ExperienceManagement;
