// src/features/user/utils/userConfig.ts
export const API_CONFIG = {
  DEFAULT_USER_ID: import.meta.env.VITE_DEFAULT_USER_ID || '1',
  IS_MONGODB: import.meta.env.VITE_USE_SQLITE !== 'true',
};

export const getUserId = () =>
  API_CONFIG.IS_MONGODB ? 'dynamic-admin-id' : API_CONFIG.DEFAULT_USER_ID;
