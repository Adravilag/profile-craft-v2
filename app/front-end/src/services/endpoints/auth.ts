import type { UserProfile } from '@/types/api';
import {
  authLogin as authLoginImpl,
  authRegister as authRegisterImpl,
  authLogout as authLogoutImpl,
  getDevToken as getDevTokenImpl,
  setDevelopmentToken as setDevelopmentTokenImpl,
  clearAuthToken as clearAuthTokenImpl,
  hasRegisteredUser as hasRegisteredUserImpl,
} from '../api';

/**
 * Inicia sesión con email y contraseña.
 * @param credentials Objeto con { email, password }
 * @returns Respuesta del backend (puede incluir token/usuario)
 */
export const authLogin = (credentials: { email: string; password: string }) =>
  authLoginImpl(credentials);

/**
 * Registra un nuevo usuario.
 * @param data Objeto con { name, email, password }
 * @returns Respuesta del backend con el usuario creado
 */
export const authRegister = (data: { name: string; email: string; password: string }) =>
  authRegisterImpl(data);

/**
 * Cierra la sesión del usuario actual.
 * @returns Respuesta del backend
 */
export const authLogout = () => authLogoutImpl();

/**
 * Obtiene un token de desarrollo desde el endpoint de dev (solo en entornos locales).
 * @returns { token, user }
 */
export const getDevToken = () => getDevTokenImpl();

/**
 * Establece un token de desarrollo en localStorage (si existe VITE_DEV_JWT_TOKEN).
 * @returns boolean indicando si se pudo establecer
 */
export const setDevelopmentToken = () => setDevelopmentTokenImpl();

/**
 * Limpia el token de autenticación del almacenamiento local.
 */
export const clearAuthToken = () => clearAuthTokenImpl();

/**
 * Comprueba si existe al menos un usuario registrado en el backend.
 * @returns Promise<boolean>
 */
export const hasRegisteredUser = () => hasRegisteredUserImpl();

export type { UserProfile };
