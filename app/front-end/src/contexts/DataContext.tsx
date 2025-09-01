// src/contexts/DataContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profile, experiences, projects } from '@/services/endpoints';
const { getUserProfile } = profile;
const { getExperiences } = experiences;
const { getProjects } = projects;
import type { UserProfile, Experience, Project } from '@/types/api';
import { debugLog } from '../utils/debugConfig';

interface DataContextType {
  // Datos
  profile: UserProfile | null;
  experiences: Experience[];
  projects: Project[];

  // Estados de carga
  profileLoading: boolean;
  experiencesLoading: boolean;
  projectsLoading: boolean;

  // Errores
  profileError: string | null;
  experiencesError: string | null;
  projectsError: string | null;

  // Funciones de precarga
  preloadProfile: () => Promise<void>;
  preloadExperiences: () => Promise<void>;
  preloadProjects: () => Promise<void>;
  preloadSection: (sectionId: string) => Promise<void>;

  // Estado general
  isAnyLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Estados de datos
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Estados de carga
  const [profileLoading, setProfileLoading] = useState(false);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Estados de error
  const [profileError, setProfileError] = useState<string | null>(null);
  const [experiencesError, setExperiencesError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Cache flags para evitar múltiples cargas
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [experiencesLoaded, setExperiencesLoaded] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  // Función para precargar el perfil
  const preloadProfile = useCallback(async () => {
    if (profileLoaded || profileLoading) return;

    setProfileLoading(true);
    setProfileError(null);

    try {
      const data = await getUserProfile();
      setProfile(data);
      setProfileLoaded(true);

      if (process.env.NODE_ENV === 'development') {
        debugLog.dataLoading('DataContext: Perfil de usuario cargado');
      }
    } catch (error) {
      setProfileError('No se pudo cargar el perfil.');
      debugLog.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [profileLoaded, profileLoading]);

  // Función para precargar experiencias
  const preloadExperiences = useCallback(async () => {
    if (experiencesLoaded || experiencesLoading) return;

    setExperiencesLoading(true);
    setExperiencesError(null);

    try {
      const data = await getExperiences();
      setExperiences(data);
      setExperiencesLoaded(true);

      if (process.env.NODE_ENV === 'development') {
        debugLog.dataLoading('DataContext: Experiencias cargadas');
      }
    } catch (error) {
      setExperiencesError('No se pudo cargar las experiencias.');
      debugLog.error('Error loading experiences:', error);
    } finally {
      setExperiencesLoading(false);
    }
  }, [experiencesLoaded, experiencesLoading]);

  // Función para precargar artículos
  const preloadProjects = useCallback(async () => {
    if (projectsLoaded || projectsLoading) return;

    setProjectsLoading(true);
    setProjectsError(null);

    try {
      const data = await getProjects();
      setProjects(data);
      setProjects(data);
      setProjectsLoaded(true);
      setProjectsLoaded(true);

      if (process.env.NODE_ENV === 'development') {
        debugLog.dataLoading('DataContext: Artículos cargados');
      }
    } catch (error) {
      setProjectsError('No se pudo cargar los artículos.');
      debugLog.error('Error loading projects:', error);
    } finally {
      setProjectsLoading(false);
      setProjectsLoading(false);
    }
  }, [projectsLoaded, projectsLoading]);

  // (no-op wrapper removed to avoid duplicate declaration)

  // Función para precargar datos específicos de una sección
  const preloadSection = useCallback(
    async (sectionId: string) => {
      const promises: Promise<void>[] = [];

      switch (sectionId) {
        case 'about':
          promises.push(preloadProfile());
          break;
        case 'experience':
          promises.push(preloadExperiences());
          break;
        case 'projects':
          promises.push(preloadProjects());
          break;
        case 'contact':
          promises.push(preloadProfile());
          break;
        default:
          promises.push(preloadProfile());
          break;
      }

      await Promise.all(promises);
    },
    [preloadProfile, preloadExperiences, preloadProjects]
  );

  // Escuchar eventos de precarga desde NavigationContext
  useEffect(() => {
    const handlePreload = (event: CustomEvent) => {
      const { sectionId } = event.detail;

      if (process.env.NODE_ENV === 'development') {
        debugLog.dataLoading(`DataContext: Precargando datos para sección "${sectionId}"`);
      }

      preloadSection(sectionId);
    };

    document.addEventListener('sectionPreload', handlePreload as EventListener);

    return () => {
      document.removeEventListener('sectionPreload', handlePreload as EventListener);
    };
  }, [preloadSection]);

  // Cargar datos iniciales (perfil siempre se carga al inicio)
  useEffect(() => {
    preloadProfile();
  }, [preloadProfile]);

  // Estado general de carga
  const isAnyLoading = profileLoading || experiencesLoading || projectsLoading;

  const value: DataContextType = {
    profile,
    experiences,
    projects,
    profileLoading,
    experiencesLoading,
    projectsLoading,
    profileError,
    experiencesError,
    projectsError,
    preloadProfile,
    preloadExperiences,
    preloadProjects,
    preloadSection,
    isAnyLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
