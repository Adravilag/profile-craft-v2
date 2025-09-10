// src/features/user/services/userApi.ts
import { API } from '@/services/http';
import { API_CONFIG } from '../utils/userConfig';

let cachedAdminUsername: string | null = null;
let cachedAdminUserId: string | null = null;

export const getFirstAdminUsername = async (): Promise<string> => {
  if (cachedAdminUsername) return cachedAdminUsername;
  // Nota: no usar prefijo '/' para que axios concatene correctamente con baseURL que ya incluye '/api'
  const { data } = await API.get('auth/first-admin-user');
  if ((data as any)?.success && (data as any)?.user?.username) {
    cachedAdminUsername = (data as any).user.username;
    return cachedAdminUsername;
  }
  if (API_CONFIG.IS_MONGODB)
    throw new Error('No se pudo obtener el username del usuario administrador');
  return 'admin'; // Fallback por defecto
};

// Función legacy para compatibilidad - ahora obtendrá el username en lugar del ID
/**
 * Obtiene el ID público del primer usuario administrador
 * @returns Promise<string> - ID público del administrador (ej: 'admin')
 */
export const getFirstAdminUserId = async (): Promise<string> => {
  try {
    // Retornar del cache si ya existe
    if (cachedAdminUserId) {
      return cachedAdminUserId;
    }

    const { data } = await API.get('auth/first-admin-user');

    if (!(data as any).success || !(data as any).user?.publicId) {
      throw new Error('No se pudo obtener el ID público del usuario administrador');
    }

    // Cachear el resultado
    cachedAdminUserId = (data as any).user.publicId; // 'admin'
    return cachedAdminUserId;
  } catch (error) {
    console.error('Error obteniendo el ID público del usuario administrador:', error);
    throw new Error('No se pudo obtener el ID público del usuario administrador');
  }
};

export const hasRegisteredUser = async (): Promise<boolean> => {
  // Respetar baseURL; usar ruta relativa sin '/'
  const { data } = await API.get('auth/has-user');
  return !!(data as any)?.exists;
};
