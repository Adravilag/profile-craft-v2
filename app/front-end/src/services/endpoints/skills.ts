import type { Skill } from '@/types/api';
import {
  getSkills as getSkillsImpl,
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
export const updateSkill = (id: number, skill: Partial<Skill>) => updateSkillImpl(id, skill);

/**
 * Elimina una habilidad por id.
 */
export const deleteSkill = (id: number) => deleteSkillImpl(id);

export type { Skill };
