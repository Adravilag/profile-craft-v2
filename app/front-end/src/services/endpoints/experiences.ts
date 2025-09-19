import type { Experience } from '@/types/api';
import {
  getExperiences as getExperiencesImpl,
  createExperience as createExperienceImpl,
  updateExperience as updateExperienceImpl,
  deleteExperience as deleteExperienceImpl,
} from '../api';

/**
 * Obtiene experiencias profesionales del usuario.
 */
export const getExperiences = () => getExperiencesImpl();

/**
 * Crea una nueva experiencia.
 */
export const createExperience = (experience: Omit<Experience, 'id'>) =>
  createExperienceImpl(experience);

/**
 * Actualiza una experiencia existente.
 */
export const updateExperience = (id: string, experience: Partial<Experience>) =>
  updateExperienceImpl(id, experience);

/**
 * Elimina una experiencia por id.
 */
export const deleteExperience = (id: string) => deleteExperienceImpl(id);

export type { Experience };
