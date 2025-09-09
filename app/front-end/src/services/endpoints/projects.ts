import type { Project } from '@/types/api';
import {
  getProjects as getProjectsImpl,
  getProjectById as getProjectByIdImpl,
  createProject as createProjectImpl,
  updateProject as updateProjectImpl,
  deleteProject as deleteProjectImpl,
} from '../api';

/**
 * Obtiene los proyectos del usuario.
 * @returns Promise<article[]>
 */
export const getProjects = () => getProjectsImpl();

/**
 * Obtiene un proyecto por id.
 */
export const getProjectById = (id: string) => getProjectByIdImpl(id);

/**
 * Crea un nuevo proyecto.
 */
export const createProject = (project: Omit<Project, 'id'>) => createProjectImpl(project);

/**
 * Actualiza un proyecto existente.
 */
export const updateProject = (id: string, project: Partial<Project>) =>
  updateProjectImpl(id, project);

/**
 * Elimina un proyecto.
 */
export const deleteProject = (id: string) => deleteProjectImpl(id);

/**
 * Obtiene proyectos para administración (temporal stub).
 */
export const getAdminProjects = () => getProjectsImpl();

export type { Project };
