import axios from 'axios';
import type {
  UserProfile,
  Experience,
  Skill,
  Testimonial,
  Project,
  Certification,
  Education,
  MediaItem,
  UploadResponse,
} from '@/types/api';

// Re-export types for backwards compatibility with imports from '@/services/api'
export type {
  UserProfile,
  Experience,
  Skill,
  Testimonial,
  Project,
  Certification,
  Education,
  MediaItem,
  UploadResponse,
};
import { debugLog } from '../utils/debugConfig';
import { getDynamicUserId } from '@/features/users/services/userId';
import { getUserId } from '@/features/users/utils/userConfig';

// If using Vite, use import.meta.env; if using Create React App, ensure @types/node is installed and add a declaration for process.env if needed.
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
debugLog.api('🔧 API Base URL configurada:', API_BASE_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Importante para cookies httpOnly
});

// Interceptor para log de respuestas
API.interceptors.response.use(
  response => {
    debugLog.api('✅ Respuesta exitosa de:', response.config.url || 'unknown', response.data);
    return response;
  },
  error => {
    debugLog.error('❌ Error en respuesta de:', error.config?.url || 'unknown', error);
    return Promise.reject(error);
  }
);

// Tipos migrados a `src/types/api.ts` — reusar desde allí.

// getDynamicUserId y getUserId son provistos por los módulos de features/users

export const getUserProfile = async () => {
  const userId = await getDynamicUserId();
  debugLog.api('🔄 Obteniendo perfil para usuario:', userId);
  return API.get<UserProfile>(`/profile/${userId}`).then(r => r.data);
};

// Obtener perfil completo (CV) por id o por el usuario dinámico si no se pasa id
export const getFullUserProfile = async (userId?: string) => {
  const id = userId ?? (await getDynamicUserId());
  debugLog.api('🔄 Obteniendo perfil FULL para usuario:', id);
  return API.get<UserProfile>(`/profile/${id}/full`).then(r => r.data);
};

// Obtener sólo el patrón (pattern) del perfil público por id
export const getProfilePattern = async (userId?: string): Promise<{ pattern: string | null }> => {
  const id = userId ?? (await getDynamicUserId());
  debugLog.api('🔄 Obteniendo pattern para usuario:', id);
  return API.get<{ pattern: string | null }>(`/profile/pattern/${id}`).then(r => r.data);
};

// Nueva función para obtener el perfil del usuario autenticado
export const getAuthenticatedUserProfile = async () => {
  debugLog.api('📡 getAuthenticatedUserProfile: Iniciando petición...');
  const token = localStorage.getItem('portfolio_auth_token');
  debugLog.api('🔑 Token disponible:', token ? 'Sí' : 'No');
  debugLog.api('🔗 URL de petición:', `${API_BASE_URL}/profile/auth/profile`);

  try {
    const response = await API.get<UserProfile>(`/profile/auth/profile`);
    debugLog.api('✅ getAuthenticatedUserProfile: Respuesta exitosa:', response.data);
    return response.data;
  } catch (error) {
    debugLog.error('❌ getAuthenticatedUserProfile: Error en petición:', error);
    debugLog.error('❌ Error details:', {
      status: (error as any)?.response?.status,
      statusText: (error as any)?.response?.statusText,
      data: (error as any)?.response?.data,
      message: (error as any)?.message,
    });
    throw error;
  }
};

export const updateProfile = (profileData: Partial<UserProfile>) => {
  debugLog.api('🔄 Actualizando perfil con datos:', profileData);
  debugLog.api('🔍 Datos enviados:', JSON.stringify(profileData, null, 2));

  // Validar que tengamos los campos mínimos
  if (!profileData.name || !profileData.email || !profileData.role_title || !profileData.about_me) {
    debugLog.warn('⚠️ Faltan campos obligatorios:', {
      name: !!profileData.name,
      email: !!profileData.email,
      role_title: !!profileData.role_title,
      about_me: !!profileData.about_me,
    });
  }

  return API.put<UserProfile>(`/profile/auth/profile`, profileData)
    .then(response => {
      debugLog.api('✅ Perfil actualizado exitosamente:', response.data);
      return response.data;
    })
    .catch(error => {
      debugLog.error('❌ Error actualizando perfil:', error);
      debugLog.error('📊 Status:', error.response?.status);
      debugLog.error('📋 Data:', error.response?.data);
      debugLog.error('🔍 Headers:', error.response?.headers);
      throw error;
    });
};

export const getExperiences = async () => {
  const userId = await getDynamicUserId();
  debugLog.api('🔄 Obteniendo experiencias para usuario:', userId);
  return API.get<Experience[]>(`/experiences?userId=${userId}`).then(r => r.data);
};

export const createExperience = async (experience: Omit<Experience, 'id'>) => {
  const userId = await getDynamicUserId();
  const experienceWithUserId = { ...experience, user_id: userId };
  debugLog.api('🔄 Creando experiencia para usuario:', userId);
  return API.post<Experience>(`/admin/experiences`, experienceWithUserId).then(r => r.data);
};

export const updateExperience = (id: string, experience: Partial<Experience>) =>
  API.put<Experience>(`/admin/experiences/${id}`, experience).then(r => r.data);

export const deleteExperience = (id: string) => API.delete(`/admin/experiences/${id}`);

// Projects list (public)
export const getProjects = async () => {
  const userId = await getDynamicUserId();
  debugLog.api('🔄 Obteniendo proyectos para usuario:', userId);
  return API.get<Project[]>(`/projects?userId=${userId}`).then(r => r.data);
};

// Skill type imported desde src/types/api

export const getSkills = async () => {
  const userId = await getDynamicUserId();
  debugLog.api('🔄 Obteniendo habilidades para usuario:', userId);
  return API.get<Skill[]>(`/skills?userId=${userId}`).then(r => r.data);
};

export const createSkill = async (skill: Omit<Skill, 'id'>) => {
  const userId = await getDynamicUserId();

  // IMPORTANTE: Validar campos obligatorios antes de enviar la solicitud
  if (!skill.name || skill.name.trim() === '') {
    debugLog.error('❌ Error: El nombre de la habilidad es obligatorio');
    throw new Error('El nombre de la habilidad es obligatorio');
  }

  if (!skill.category || skill.category.trim() === '') {
    debugLog.error('❌ Error: La categoría de la habilidad es obligatoria');
    throw new Error('La categoría de la habilidad es obligatoria');
  }

  const skillWithUserId = { ...skill, user_id: userId };
  debugLog.api('🔄 Creando habilidad para usuario:', userId, 'con datos:', skillWithUserId);
  return API.post<Skill>(`/skills`, skillWithUserId).then(r => r.data);
};

export const updateSkill = (id: number, skill: Partial<Skill>) => {
  // Validar que al menos uno de los campos obligatorios esté presente si se está actualizando
  if (skill.name !== undefined && (!skill.name || skill.name.trim() === '')) {
    debugLog.error('❌ Error: El nombre de la habilidad no puede estar vacío');
    throw new Error('El nombre de la habilidad no puede estar vacío');
  }

  if (skill.category !== undefined && (!skill.category || skill.category.trim() === '')) {
    debugLog.error('❌ Error: La categoría de la habilidad no puede estar vacía');
    throw new Error('La categoría de la habilidad no puede estar vacía');
  }

  debugLog.api('🔄 Actualizando habilidad ID:', id, 'con datos:', skill);
  return API.put<Skill>(`/skills/${id}`, skill).then(r => r.data);
};

export const deleteSkill = (id: number) => API.delete(`/skills/${id}`);

// Testimonial, Project y otros tipos importados desde src/types/api

// Funciones públicas (solo testimonios aprobados)
export const getTestimonials = async () => {
  const userId = await getDynamicUserId();
  debugLog.api('🔄 Obteniendo testimonios para usuario:', userId);
  return API.get<Testimonial[]>(`/testimonials?userId=${userId}`).then(r => r.data);
};

export const createTestimonial = async (
  testimonial: Omit<Testimonial, 'id' | 'status' | 'created_at'>
) => {
  const userId = await getDynamicUserId();
  const testimonialWithUserId = { ...testimonial, user_id: userId };
  debugLog.api('🔄 Creando testimonio para usuario:', userId);
  return API.post<Testimonial>(`/testimonials`, testimonialWithUserId).then(r => r.data);
};

// project detail (public) - canonical route
// (kept below as async function)

// Funciones de administración para testimonios
export const getAdminTestimonials = async (status?: string) => {
  const userId = await getDynamicUserId();
  debugLog.api('🔄 Obteniendo testimonios admin para usuario:', userId);
  return API.get<Testimonial[]>(
    `/testimonials/admin?userId=${userId}${status ? `&status=${status}` : ''}`
  ).then(r => r.data);
};

export const approveTestimonial = (id: string, order_index: number = 0) =>
  API.put<Testimonial>(`/testimonials/${id}/approve`, { order_index }).then(r => r.data);

export const rejectTestimonial = (id: string) =>
  API.put<Testimonial>(`/testimonials/${id}/reject`).then(r => r.data);

export const updateAdminTestimonial = (id: string, testimonial: Partial<Testimonial>) =>
  API.put<Testimonial>(`/testimonials/${id}`, testimonial).then(r => r.data);

export const deleteTestimonial = (id: string) => API.delete(`/testimonials/${id}`);

// Funciones para certificaciones
// Certification type imported desde src/types/api

export const getCertifications = () => {
  const userId = getUserId();
  debugLog.api('🔄 Llamando a API de certificaciones para usuario:', userId);
  return API.get<Certification[]>(`/certifications?userId=${userId}`).then(r => {
    debugLog.api('Respuesta de certificaciones:', r.data);
    return r.data;
  });
};

export const createCertification = (certification: Omit<Certification, 'id'>) => {
  const userId = getUserId();
  const certificationWithUserId = { ...certification, user_id: userId };
  debugLog.api('🔄 Creando certificación para usuario:', userId);
  return API.post<Certification>(`/certifications`, certificationWithUserId).then(r => r.data);
};

export const updateCertification = (id: number | string, certification: Partial<Certification>) =>
  API.put<Certification>(`/certifications/${id}`, certification).then(r => r.data);

export const deleteCertification = (id: string | number) => API.delete(`/certifications/${id}`);

// Funciones de administración para artículos
// Admin: projects CRUD
export const getAdminProjects = () => {
  const userId = getUserId();
  debugLog.api('🔄 Obteniendo proyectos (admin) para usuario:', userId);
  return API.get<Project[]>(`/projects/admin?userId=${userId}`).then(r => r.data);
};

export const createAdminProject = (project: Omit<Project, 'id'>) => {
  const userId = getUserId();
  const projectWithUserId = { ...project, user_id: userId } as any;
  debugLog.api('🔄 Creando proyecto (admin) para usuario:', userId);
  return API.post<Project>(`/projects/admin`, projectWithUserId).then(r => r.data);
};

export const updateAdminProject = (id: string, project: Partial<Project>) =>
  API.put<Project>(`/projects/admin/${id}`, project).then(r => r.data);

export const deleteAdminProject = (id: string) => API.delete(`/projects/admin/${id}`);

// Funciones para educación académica
// Education type imported desde src/types/api

export const getEducation = () => {
  const userId = getUserId();
  debugLog.api('🔄 Llamando a API de educación para usuario:', userId);
  return API.get<Education[]>(`/education?userId=${userId}`).then(r => {
    debugLog.api('Respuesta de educación:', r.data);
    return r.data;
  });
};

export const createEducation = (education: Omit<Education, 'id' | 'created_at'>) => {
  const userId = getUserId();
  const educationWithUserId = { ...education, user_id: userId };
  debugLog.api('🔄 Creando educación para usuario:', userId);
  return API.post<Education>(`/admin/education`, educationWithUserId).then(r => r.data);
};

export const updateEducation = (id: number, education: Partial<Education>) =>
  API.put<Education>(`/admin/education/${id}`, education).then(r => r.data);

export const deleteEducation = (id: string) => {
  console.log('🔄 API: Eliminando educación con ID:', id);
  console.log('🔍 API: Tipo de ID:', typeof id, 'Longitud:', id.length);
  return API.delete(`/admin/education/${id}`);
};

// Función temporal para desarrollo - establecer token de autenticación
export const setDevelopmentToken = async () => {
  try {
    // Buscar token de desarrollo en variable de entorno SOLO en local
    if (import.meta.env && import.meta.env.VITE_DEV_JWT_TOKEN) {
      localStorage.setItem('portfolio_auth_token', import.meta.env.VITE_DEV_JWT_TOKEN);
      debugLog.api('🔑 Token de desarrollo tomado de variable de entorno VITE_DEV_JWT_TOKEN');
      return true;
    }
    debugLog.warn('⚠️ No se pudo establecer un token de desarrollo. Configura VITE_DEV_JWT_TOKEN.');
    return false;
  } catch (error) {
    debugLog.error('❌ Error obteniendo token:', error);
    return false;
  }
};

// Función para obtener token de desarrollo (solo en desarrollo)
export const getDevToken = async () => {
  try {
    const response = await API.get('/auth/dev-token');
    const { token, user } = response.data;

    // Guardar token en localStorage
    localStorage.setItem('portfolio_auth_token', token);

    debugLog.api('🔑 Token de desarrollo obtenido y guardado:', user);
    return { token, user };
  } catch (error) {
    debugLog.error('❌ Error obteniendo token de desarrollo:', error);
    throw error;
  }
};

// Función para limpiar token de localStorage
export const clearAuthToken = () => {
  localStorage.removeItem('portfolio_auth_token');
  debugLog.api('🧹 Token de autenticación eliminado');
};

// ===== FUNCIONES DE MEDIA LIBRARY =====

// MediaItem y UploadResponse importados desde src/types/api

// Subir archivo de imagen
// Subir imagen con tipo especificado
export const uploadImage = async (
  file: File,
  imageType: 'profile' | 'project' | 'avatar' = 'project'
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('imageType', imageType);

  const response = await API.post<UploadResponse>('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Obtener lista de archivos de media
export const getMediaFiles = (): Promise<MediaItem[]> =>
  API.get<MediaItem[]>('/media').then(r => r.data);

// Eliminar archivo de media
export const deleteMediaFile = (filename: string): Promise<{ success: boolean; message: string }> =>
  API.delete(`/media/${filename}`).then(r => r.data);

// Eliminar imagen de Cloudinary
export const deleteCloudinaryImage = async (
  publicId: string
): Promise<{ success: boolean; message: string }> => {
  return API.delete('/media/cloudinary/delete', {
    data: { publicId },
  }).then(r => r.data);
};

// Obtener media por id (metadatos)
export const getMediaById = (id: string): Promise<MediaItem> =>
  API.get<MediaItem>(`/media/${id}`).then(r => r.data);

// ===== AUTH =====
export const authLogin = async (credentials: { email: string; password: string }) => {
  debugLog.api('\ud83d\udd04 authLogin: intentando iniciar sesión para', credentials.email);
  const resp = await API.post('/auth/login', credentials);
  return resp.data;
};

export const authRegister = async (data: { name: string; email: string; password: string }) => {
  debugLog.api('\ud83d\udd04 authRegister: registrando usuario', data.email);
  const resp = await API.post('/auth/register', data);
  return resp.data;
};

export const authLogout = async () => {
  debugLog.api('\ud83d\udd0e authLogout: cerrando sesión');
  const resp = await API.post('/auth/logout');
  // limpiar token local si el backend maneja cookies
  clearAuthToken();
  return resp.data;
};

// ===== PROJECTS CRUD =====
// Public project CRUD
export const getProjectById = async (id: string) =>
  API.get<Project>(`/projects/${id}`).then(r => r.data);

export const createProject = async (project: Omit<Project, 'id'>) => {
  const userId = getUserId();
  const payload = { ...project, user_id: userId } as any;
  debugLog.api('🔄 Creando proyecto para usuario:', userId);
  return API.post<Project>('/projects', payload).then(r => r.data);
};

export const updateProject = async (id: string, project: Partial<Project>) =>
  API.put<Project>(`/projects/${id}`, project).then(r => r.data);

export const deleteProject = async (id: string) => API.delete(`/projects/${id}`);

export const hasRegisteredUser = async (): Promise<boolean> => {
  try {
    debugLog.api('🔍 Verificando si existe usuario registrado...');
    debugLog.api('🌐 API_BASE_URL:', API_BASE_URL);

    // Hacer la petición directamente con fetch para mayor control
    const url = `${API_BASE_URL}/auth/has-user`;
    debugLog.api('📡 URL completa:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    debugLog.api('📊 Response status:', response.status);
    debugLog.api('📊 Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    debugLog.api('✅ Respuesta completa has-user:', data);
    debugLog.api('📋 data.exists:', data.exists);
    debugLog.api('🔍 Tipo de data.exists:', typeof data.exists);

    const result = data.exists;
    debugLog.api('🎯 Resultado final:', result);
    return result;
  } catch (error) {
    debugLog.error('❌ Error verificando usuario registrado:', error);
    debugLog.error('📋 Error completo:', error);
    return false; // En caso de error, asumir que no hay usuario para permitir registro
  }
};

// Función para obtener estadísticas de vistas de un artículo (admin)
export const getProjectStats = async (projectId: string) => {
  return API.get(`/projects/admin/projects/${projectId}/stats`).then(r => r.data);
};

// ==========================================
// About Section API
// ==========================================

/**
 * Obtener la información completa de la sección About
 */
export const getAboutSection = () => API.get('/about');

/**
 * Actualizar la información de la sección About (Admin)
 */
export const updateAboutSection = (data: any) => API.put('/about', data);

/**
 * Agregar un nuevo highlight (Admin)
 */
export const addAboutHighlight = (data: any) => API.post('/about/highlights', data);

/**
 * Actualizar un highlight específico (Admin)
 */
export const updateAboutHighlight = (highlightId: string, data: any) =>
  API.put(`/about/highlights/${highlightId}`, data);

/**
 * Eliminar un highlight (Admin)
 */
export const deleteAboutHighlight = (highlightId: string) =>
  API.delete(`/about/highlights/${highlightId}`);
