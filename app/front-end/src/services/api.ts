// Reuse shared axios instance (with auth interceptor) from services/http
import { API } from './http';
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
import { createSecureLogger } from '../utils/secureLogging';
import { validateRequest, isProductionDomain } from '../utils/domainSecurity';
import { getDynamicUserId } from '@/features/users/services/userId';
import { getUserId } from '@/features/users/utils/userConfig';

// Logger seguro para evitar exposición de datos sensibles
const secureApiLogger = createSecureLogger('API');

// If using Vite, use import.meta.env; if using Create React App, ensure @types/node is installed and add a declaration for process.env if needed.
// Usar solo el dominio/base, sin /api al final
const apiUrl = import.meta.env?.VITE_API_URL;
const API_BASE_URL =
  (typeof apiUrl === 'string' ? apiUrl.replace(/\/?api\/?$/, '') : null) ||
  (import.meta.env.DEV ? '' : 'http://localhost:3000');
debugLog.api('🔧 API Base URL configurada:', API_BASE_URL);

// Validación de seguridad de dominio antes de configurar interceptors
if (typeof window !== 'undefined' && isProductionDomain()) {
  if (!validateRequest()) {
    throw new Error(
      '🚫 Acceso no autorizado: Esta aplicación solo funciona desde el dominio oficial'
    );
  }
  secureApiLogger.info('🔒 Dominio autorizado verificado para producción');
}

// Interceptor para log de respuestas SEGURO
API.interceptors.response.use(
  response => {
    secureApiLogger.info('✅ Respuesta exitosa de:', response.config.url || 'unknown');
    // Solo loggear estructura de datos, no contenido sensible
    if (response.data && typeof response.data === 'object') {
      const dataKeys = Object.keys(response.data);
      secureApiLogger.info('📊 Estructura de respuesta:', {
        keys: dataKeys,
        type: typeof response.data,
      });
    }
    return response;
  },
  error => {
    secureApiLogger.error('❌ Error en respuesta de:', error.config?.url || 'unknown');
    // Solo loggear información del error, no datos sensibles
    secureApiLogger.error('📊 Error info:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Tipos migrados a `src/types/api.ts` — reusar desde allí.

// getDynamicUserId y getUserId son provistos por los módulos de features/users

export const getUserProfile = async () => {
  // Importar la nueva función de username
  const { getFirstAdminUsername } = await import('@/features/users/services/userApi');
  const username = await getFirstAdminUsername();
  secureApiLogger.info('🔄 Obteniendo perfil por username:', { username });
  return API.get<UserProfile>(`/profile/public/username/${username}`).then(r => r.data);
};

// Nueva función para obtener el patrón de un usuario
export const getUserPattern = async (userId: string): Promise<string> => {
  secureApiLogger.info('🔄 Obteniendo patrón para usuario:', { userId });
  return API.get<{ pattern: string }>(`/profile/${userId}/pattern`).then(r => r.data.pattern);
};

// Obtener perfil completo (CV) por id o por el usuario dinámico si no se pasa id
export const getFullUserProfile = async (userId?: string) => {
  const id = userId ?? (await getDynamicUserId());
  secureApiLogger.info('🔄 Obteniendo perfil FULL para usuario:', { userId: id });
  return API.get<UserProfile>(`/profile/${id}/full`).then(r => r.data);
};

// Nueva función para obtener el perfil del usuario autenticado
export const getAuthenticatedUserProfile = async () => {
  // Validación de dominio en producción

  if (isProductionDomain() && !validateRequest()) {
    throw new Error('🚫 Acceso no autorizado desde este dominio');
  }

  secureApiLogger.info('📡 getAuthenticatedUserProfile: Iniciando petición...');
  const token = localStorage.getItem('portfolio_auth_token');
  secureApiLogger.info('🔑 Token disponible:', { hasToken: !!token });
  secureApiLogger.info('🔗 URL de petición:', `${API_BASE_URL}/profile/auth/profile`);

  try {
    const response = await API.get<UserProfile>(`/profile/auth/profile`);
    secureApiLogger.info('✅ getAuthenticatedUserProfile: Respuesta exitosa');
    return response.data;
  } catch (error) {
    secureApiLogger.error('❌ getAuthenticatedUserProfile: Error en petición:', {
      status: (error as any)?.response?.status,
      statusText: (error as any)?.response?.statusText,
      message: (error as any)?.message,
    });
    throw error;
  }
};

export const updateProfile = (profileData: Partial<UserProfile>) => {
  // Validación de dominio en producción para operaciones de escritura
  if (isProductionDomain() && !validateRequest()) {
    throw new Error('🚫 Acceso no autorizado desde este dominio');
  }

  secureApiLogger.info('🔄 Actualizando perfil...');
  // Log seguro de campos pero no valores sensibles
  const fieldsToUpdate = Object.keys(profileData);
  secureApiLogger.info('🔍 Campos a actualizar:', { fields: fieldsToUpdate });

  // Validar que tengamos los campos mínimos
  if (!profileData.name || !profileData.email || !profileData.role_title || !profileData.about_me) {
    secureApiLogger.warn('⚠️ Faltan campos obligatorios:', {
      name: !!profileData.name,
      email: !!profileData.email,
      role_title: !!profileData.role_title,
      about_me: !!profileData.about_me,
    });
  }

  return API.put<UserProfile>(`/profile/auth/profile`, profileData)
    .then(response => {
      secureApiLogger.info('✅ Perfil actualizado exitosamente');
      return response.data;
    })
    .catch(error => {
      secureApiLogger.error('❌ Error actualizando perfil:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });
      throw error;
    });
};

export const getExperiences = async () => {
  const userId = await getDynamicUserId();
  secureApiLogger.info('🔄 Obteniendo experiencias');
  return API.get<Experience[]>(`/experiences?userId=${userId}`).then(r => r.data);
};

export const createExperience = async (experience: Omit<Experience, 'id'>) => {
  const userId = await getDynamicUserId();
  const experienceWithUserId = { ...experience, user_id: userId };
  secureApiLogger.info('🔄 Creando experiencia');
  return API.post<Experience>(`/admin/experiences`, experienceWithUserId).then(r => r.data);
};

export const updateExperience = (id: string, experience: Partial<Experience>) =>
  API.put<Experience>(`/admin/experiences/${id}`, experience).then(r => r.data);

export const deleteExperience = (id: string) => API.delete(`/admin/experiences/${id}`);

// Projects list (public)
export const getProjects = async () => {
  const userId = await getDynamicUserId();
  secureApiLogger.info('🔄 Obteniendo proyectos');
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

export const updateCertification = (id: number | string, certification: Partial<Certification>) => {
  return API.put<Certification>(`/certifications/${id}`, certification).then(r => r.data);
};

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
  return API.delete(`/admin/education/${id}`);
};

// Función temporal para desarrollo - establecer token de autenticación
export const setDevelopmentToken = async () => {
  try {
    // Buscar token de desarrollo en variable de entorno SOLO en local
    const devToken = import.meta.env?.VITE_DEV_JWT_TOKEN;
    if (import.meta.env && typeof devToken === 'string') {
      localStorage.setItem('portfolio_auth_token', devToken);
      // En desarrollo también exponer la cookie no-HttpOnly para que el backend
      // que valida req.cookies.portfolio_auth_token pueda leerla en requests.
      try {
        if (import.meta.env.DEV) {
          document.cookie = `portfolio_auth_token=${devToken}; path=/`;
          secureApiLogger.info('🔑 Cookie de desarrollo seteada');
        }
      } catch (e) {
        // silenciar en entornos donde document no exista
      }
      secureApiLogger.info('🔑 Token de desarrollo establecido desde variable de entorno');
      return true;
    }
    secureApiLogger.warn(
      '⚠️ No se pudo establecer un token de desarrollo. Configura VITE_DEV_JWT_TOKEN.'
    );
    return false;
  } catch (error) {
    secureApiLogger.error('❌ Error obteniendo token:', { message: (error as Error).message });
    return false;
  }
};

// Función para obtener token de desarrollo (solo en desarrollo)
export const getDevToken = async () => {
  try {
    // Preferir endpoint devLogin que setea la cookie httpOnly en el servidor
    // (solo disponible en desarrollo). Hacer fallback a /auth/dev-token si no
    // está disponible.
    try {
      const resp = await fetch('/api/auth/devLogin', { method: 'POST', credentials: 'include' });
      if (resp.ok) {
        const data = await resp.json();
        secureApiLogger.info('🔑 devLogin exitoso, cookie seteada por backend');
        return { token: null, user: data.user };
      }
    } catch (e) {
      // fallback
    }

    const response = await API.get('/auth/dev-token');
    const { token, user } = response.data as any;

    // Guardar token en localStorage y también exponer cookie no-HttpOnly en dev
    localStorage.setItem('portfolio_auth_token', token);
    try {
      if (import.meta.env.DEV) document.cookie = `portfolio_auth_token=${token}; path=/`;
    } catch {}

    secureApiLogger.info('🔑 Token de desarrollo obtenido y guardado');
    return { token, user };
  } catch (error) {
    secureApiLogger.error('❌ Error obteniendo token de desarrollo:', {
      message: (error as Error).message,
    });
    throw error;
  }
};

// Función para limpiar token de localStorage
export const clearAuthToken = () => {
  localStorage.removeItem('portfolio_auth_token');
  secureApiLogger.info('🧹 Token de autenticación eliminado');
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
  API.get<MediaItem[]>('/media').then(r => r.data) as Promise<MediaItem[]>;

// Eliminar archivo de media
export const deleteMediaFile = (filename: string): Promise<{ success: boolean; message: string }> =>
  API.delete(`/media/${filename}`).then(r => r.data) as Promise<{
    success: boolean;
    message: string;
  }>;

// Eliminar imagen de Cloudinary
export const deleteCloudinaryImage = async (
  publicId: string
): Promise<{ success: boolean; message: string }> => {
  return API.request({
    method: 'DELETE',
    url: '/media/cloudinary/delete',
    data: { publicId },
  }).then(r => r.data) as unknown as Promise<{ success: boolean; message: string }>;
};

// Obtener media por id (metadatos)
export const getMediaById = (id: string): Promise<MediaItem> =>
  API.get<MediaItem>(`/media/${id}`).then(r => r.data) as Promise<MediaItem>;

// ===== AUTH =====
export const authLogin = async (credentials: { email: string; password: string }) => {
  // Validación de dominio crítica para autenticación
  if (isProductionDomain() && !validateRequest()) {
    throw new Error(
      '🚫 Acceso no autorizado: Autenticación solo permitida desde el dominio oficial'
    );
  }

  secureApiLogger.info('🔄 authLogin: intentando iniciar sesión');
  const resp = await API.post('/auth/login', credentials);
  return resp.data;
};

export const authRegister = async (data: { name: string; email: string; password: string }) => {
  // Validación de dominio crítica para registro
  if (isProductionDomain() && !validateRequest()) {
    throw new Error('🚫 Acceso no autorizado: Registro solo permitido desde el dominio oficial');
  }

  secureApiLogger.info('🔄 authRegister: registrando usuario');
  const resp = await API.post('/auth/register', data);
  return resp.data;
};

export const authLogout = async () => {
  secureApiLogger.info('� authLogout: cerrando sesión');
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
  debugLog.api('🔄 Creando proyecto para usuario (admin):', userId);
  return API.post<Project>('/projects/admin', payload).then(r => r.data);
};

export const updateProject = async (id: string, project: Partial<Project>) =>
  API.put<Project>(`/projects/admin/${id}`, project).then(r => r.data);

export const deleteProject = async (id: string) => API.delete(`/projects/admin/${id}`);

export const hasRegisteredUser = async (): Promise<boolean> => {
  try {
    secureApiLogger.info('🔍 Verificando si existe usuario registrado...');
    secureApiLogger.info('🌐 API_BASE_URL configurada');

    // Hacer la petición directamente con fetch para mayor control
    const url = `${API_BASE_URL}/api/auth/has-user`;
    secureApiLogger.info('📡 Realizando petición has-user');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    secureApiLogger.info('📊 Response status:', { status: response.status, ok: response.ok });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    secureApiLogger.info('✅ Respuesta has-user recibida:', { exists: data.exists });

    const result = data.exists;
    secureApiLogger.info('🎯 Resultado final:', { result });
    return result;
  } catch (error) {
    secureApiLogger.error('❌ Error verificando usuario registrado:', {
      message: (error as Error).message,
    });
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
