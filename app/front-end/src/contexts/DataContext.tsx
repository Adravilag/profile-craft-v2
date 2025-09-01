// src/contexts/DataContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profile, experiences, projects } from '@/services/endpoints';
const { getUserProfile } = profile;
const { getExperiences } = experiences;
const { getProjects } = projects;
import type { UserProfile, Experience, Project } from '@/types/api';
import { debugLog } from '@/utils/debugConfig';

interface DataContextType {
  profile: UserProfile | null;
  experiences: Experience[];
  projects: Project[];

  profileLoading: boolean;
  experiencesLoading: boolean;
  projectsLoading: boolean;

  profileError: string | null;
  experiencesError: string | null;
  projectsError: string | null;

  preloadProfile: () => Promise<void>;
  preloadExperiences: () => Promise<void>;
  preloadProjects: () => Promise<void>;
  preloadSection: (sectionId: string) => Promise<void>;

  isAnyLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projectsState, setProjectsState] = useState<Project[]>([]);

  const [profileLoading, setProfileLoading] = useState(false);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [experiencesError, setExperiencesError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [experiencesLoaded, setExperiencesLoaded] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const preloadProfile = useCallback(async () => {
    if (profileLoaded || profileLoading) return;
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await getUserProfile();
      setProfile(data);
      setProfileLoaded(true);
      if (process.env.NODE_ENV === 'development')
        debugLog.dataLoading('DataContext: Perfil de usuario cargado');
    } catch (err) {
      setProfileError('No se pudo cargar el perfil.');
      debugLog.error('Error loading profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, [profileLoaded, profileLoading]);

  const preloadExperiences = useCallback(async () => {
    if (experiencesLoaded || experiencesLoading) return;
    setExperiencesLoading(true);
    setExperiencesError(null);
    try {
      const data = await getExperiences();
      setExperiences(data);
      setExperiencesLoaded(true);
      if (process.env.NODE_ENV === 'development')
        debugLog.dataLoading('DataContext: Experiencias cargadas');
    } catch (err) {
      setExperiencesError('No se pudo cargar las experiencias.');
      debugLog.error('Error loading experiences:', err);
    } finally {
      setExperiencesLoading(false);
    }
  }, [experiencesLoaded, experiencesLoading]);

  const preloadProjects = useCallback(async () => {
    if (projectsLoaded || projectsLoading) return;
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const data = await getProjects();
      setProjectsState(data);
      setProjectsLoaded(true);
      if (process.env.NODE_ENV === 'development')
        debugLog.dataLoading('DataContext: Proyectos cargados');
    } catch (err) {
      setProjectsError('No se pudo cargar los proyectos.');
      debugLog.error('Error loading projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  }, [projectsLoaded, projectsLoading]);

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
      }
      await Promise.all(promises);
    },
    [preloadProfile, preloadExperiences, preloadProjects]
  );

  useEffect(() => {
    const handlePreload = (event: CustomEvent) => {
      const { sectionId } = event.detail;
      if (process.env.NODE_ENV === 'development')
        debugLog.dataLoading(`DataContext: Precargando datos para sección "${sectionId}"`);
      preloadSection(sectionId);
    };
    document.addEventListener('sectionPreload', handlePreload as EventListener);
    return () => document.removeEventListener('sectionPreload', handlePreload as EventListener);
  }, [preloadSection]);

  useEffect(() => {
    preloadProfile();
  }, [preloadProfile]);

  const isAnyLoading = profileLoading || experiencesLoading || projectsLoading;

  const value: DataContextType = {
    profile,
    experiences,
    projects: projectsState,
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

export default DataContext;
