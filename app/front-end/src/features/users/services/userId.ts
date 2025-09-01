// src/features/user/services/userId.ts
import { API_CONFIG } from '../utils/userConfig';
import { getFirstAdminUserId } from './userApi';
import { getUserId as getStaticUserId } from '../utils/userConfig';

export const getDynamicUserId = async () =>
  API_CONFIG.IS_MONGODB ? getFirstAdminUserId() : getStaticUserId();
