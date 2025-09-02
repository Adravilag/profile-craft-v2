import { useState, useCallback, useMemo } from 'react';
import { useExperience } from '@/hooks/useExperience';
import { useEducation } from '@/hooks/useEducation';
import { useNotificationContext } from '@/hooks/useNotification';
import type { Experience, Education } from '@/types/api';

export type AdminSection = 'experience' | 'education';
export type EditingType = 'experience' | 'education' | null;

interface UseExperienceAdminReturn {
  // Estados
  showAdminModal: boolean;
  activeAdminSection: AdminSection;
  showForm: boolean;
  editingId: string | null;
  editingType: EditingType;

  // Datos
  experiences: Experience[];
  education: Education[];
  sortedExperiences: Experience[];
  sortedEducation: Education[];

  // Estadísticas rápidas
  experienceCount: number;
  educationCount: number;

  // Funciones de modal
  openAdminModal: () => void;
  closeAdminModal: () => void;
  setActiveAdminSection: (section: AdminSection) => void;

  // Funciones de formulario
  handleNewItem: () => void;
  handleEditExperience: (experience: Experience) => void;
  handleEditEducation: (education: Education) => void;
  handleCloseForm: () => void;

  // Funciones CRUD
  createExperience: (data: any) => Promise<void>;
  updateExperience: (id: string, data: any) => Promise<void>;
  removeExperience: (id: string, title: string) => Promise<void>;
  createEducation: (data: any) => Promise<void>;
  updateEducation: (id: number, data: any) => Promise<void>;
  removeEducation: (id: number | string, title: string) => Promise<void>;
}

export const useExperienceAdmin = (): UseExperienceAdminReturn => {
  const { showSuccess, showError } = useNotificationContext();
  const {
    experiences,
    create: createExperience,
    update: updateExperience,
    remove: removeExperience,
  } = useExperience();

  const {
    education,
    create: createEducation,
    update: updateEducation,
    remove: removeEducation,
  } = useEducation();

  // Estados del modal de administración
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [activeAdminSection, setActiveAdminSection] = useState<AdminSection>('experience');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<EditingType>(null);

  // Funciones para manejar el modal de administración
  const openAdminModal = useCallback(() => {
    setShowAdminModal(true);
  }, []);

  const closeAdminModal = useCallback(() => {
    setShowAdminModal(false);
    setShowForm(false);
    setEditingId(null);
    setEditingType(null);
  }, []);

  // Función para manejar nuevo item
  const handleNewItem = useCallback(() => {
    setEditingId(null);
    setEditingType(activeAdminSection);
    setShowForm(true);
  }, [activeAdminSection]);

  // Función para manejar edición de experiencia
  const handleEditExperience = useCallback((experience: Experience) => {
    setEditingId(experience._id);
    setEditingType('experience');
    setShowForm(true);
  }, []);

  // Función para manejar edición de educación
  const handleEditEducation = useCallback((education: Education) => {
    const eduId = education._id || education.id?.toString();
    setEditingId(eduId || null);
    setEditingType('education');
    setShowForm(true);
  }, []);

  // Función para cerrar formulario
  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setEditingType(null);
  }, []);

  // Función de utilidad para ordenar por fecha
  const sortByEndDate = useCallback(<T extends { end_date?: string }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.end_date || '').getTime() || 0;
      const dateB = new Date(b.end_date || '').getTime() || 0;
      return dateB - dateA; // Descendente (más reciente primero)
    });
  }, []);

  // Listas ordenadas para administración
  const sortedExperiences = useMemo(() => {
    if (!Array.isArray(experiences)) return [];
    return sortByEndDate(experiences);
  }, [experiences, sortByEndDate]);

  const sortedEducation = useMemo(() => {
    if (!Array.isArray(education)) return [];
    return sortByEndDate(education);
  }, [education, sortByEndDate]);

  // Estadísticas rápidas
  const experienceCount = useMemo(() => {
    return Array.isArray(experiences) ? experiences.length : 0;
  }, [experiences]);

  const educationCount = useMemo(() => {
    return Array.isArray(education) ? education.length : 0;
  }, [education]);

  return {
    // Estados
    showAdminModal,
    activeAdminSection,
    showForm,
    editingId,
    editingType,

    // Datos
    experiences,
    education,
    sortedExperiences,
    sortedEducation,

    // Estadísticas
    experienceCount,
    educationCount,

    // Funciones de modal
    openAdminModal,
    closeAdminModal,
    setActiveAdminSection,

    // Funciones de formulario
    handleNewItem,
    handleEditExperience,
    handleEditEducation,
    handleCloseForm,

    // Funciones CRUD (re-exportadas con tipos mejorados)
    createExperience,
    updateExperience,
    removeExperience,
    createEducation,
    updateEducation,
    removeEducation,
  };
};

export default useExperienceAdmin;
