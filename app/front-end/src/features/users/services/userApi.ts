// src/features/user/services/userApi.ts
import { API } from '@/services/http';
import { API_CONFIG, getUserId } from '../utils/userConfig';

let cachedAdminUserId: string | null = null;

export const getFirstAdminUserId = async (): Promise<string> => {
  if (cachedAdminUserId) return cachedAdminUserId;
  const { data } = await API.get('/auth/first-admin-user');
  if (data?.success && data?.user?.id) {
    cachedAdminUserId = data.user.id;
    return cachedAdminUserId;
  }
  if (API_CONFIG.IS_MONGODB) throw new Error('No se pudo obtener el ID del usuario administrador');
  return getUserId();
};

export const hasRegisteredUser = async (): Promise<boolean> => {
  const { data } = await API.get('/auth/has-user');
  return !!data?.exists;
};
