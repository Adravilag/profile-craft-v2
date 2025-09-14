import type { Skill } from '@/types/api';
import {
  getSkills as getSkillsImpl,
  getSkill as getSkillImpl,
  createSkill as createSkillImpl,
  updateSkill as updateSkillImpl,
  deleteSkill as deleteSkillImpl,
} from '../api';

/**
 * Obtiene las habilidades del usuario.
 */
export const getSkills = () => getSkillsImpl();

/**
 * Crea una nueva habilidad.
 */
export const createSkill = (skill: Omit<Skill, 'id'>) => createSkillImpl(skill);

/**
 * Actualiza una habilidad existente.
 */
export const updateSkill = (id: number | string, skill: Partial<Skill>) =>
  updateSkillImpl(id as any, skill);

/**
 * Elimina una habilidad por id.
 */
export const deleteSkill = (id: number | string) => deleteSkillImpl(id as any);

/**
 * Obtiene una sola skill por id.
 */
export const getSkill = (id: number | string, options?: { signal?: AbortSignal }) =>
  getSkillImpl(id as any, options);

export type { Skill };
