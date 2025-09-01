// src/features/experiences/api.ts
import { API } from '@/services/http';
import { getDynamicUserId } from '@/features/users/services/userId';
import type { Experience } from '@/types/api';

export const getExperiences = async () => {
  const userId = await getDynamicUserId();
  return API.get<Experience[]>(`/experiences`, { params: { userId } }).then(r => r.data);
};
