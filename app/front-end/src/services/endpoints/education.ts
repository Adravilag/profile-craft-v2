import type { Education } from '@/types/api';
import {
  getEducation as getEducationImpl,
  createEducation as createEducationImpl,
  updateEducation as updateEducationImpl,
  deleteEducation as deleteEducationImpl,
} from '../api';

/**
 * Obtiene la educación académica del usuario.
 */
export const getEducation = () => getEducationImpl();

/**
 * Crea un registro de educación.
 */
export const createEducation = (education: Omit<Education, 'id' | 'created_at'>) =>
  createEducationImpl(education);

/**
 * Actualiza un registro de educación.
 */
export const updateEducation = (id: number, education: Partial<Education>) =>
  updateEducationImpl(id, education);

/**
 * Elimina un registro de educación.
 */
export const deleteEducation = (id: string) => deleteEducationImpl(id);

export type { Education };
