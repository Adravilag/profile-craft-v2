import type { UserProfile } from '@/types/api';
import {
  getUserProfile as getUserProfileImpl,
  getAuthenticatedUserProfile as getAuthenticatedUserProfileImpl,
  updateProfile as updateProfileImpl,
  getFullUserProfile as getFullUserProfileImpl,
  getUserPattern as getUserPatternImpl,
} from '../api';

/**
 * Obtiene el perfil público de un usuario por id.
 */
export const getUserProfile = () => getUserProfileImpl();

/**
 * Obtiene el perfil del usuario autenticado.
 */
export const getAuthenticatedUserProfile = () => getAuthenticatedUserProfileImpl();

/**
 * Actualiza el perfil del usuario autenticado.
 */
export const updateProfile = (profileData: Partial<UserProfile>) => updateProfileImpl(profileData);

/**
 * Obtiene el perfil completo (CV) para un usuario específico o el usuario dinámico si no se pasa id.
 */
export const getFullProfile = (id?: string) => getFullUserProfileImpl(id);

/**
 * Obtiene el patrón de autenticación de un usuario específico.
 */
export const getUserPattern = (userId: string) => getUserPatternImpl(userId);

export type { UserProfile };
