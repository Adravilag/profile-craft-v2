import {
  User,
  Project,
  Experience,
  Education,
  Skill,
  Certification,
  Testimonial,
  Contact,
} from '../models/index.js';
import mongoose from 'mongoose';
import { DataEncryption } from '../utils/encryption.js';
import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';

// Extender el tipo Request para incluir la propiedad user del middleware de autenticación
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Definir una interfaz para el tipo de objeto que se limpiará
interface CleanseableObject extends Record<string, any> {
  _id?: mongoose.Types.ObjectId | string;
  __v?: number;
  user_id?: mongoose.Types.ObjectId;
  password?: string;
  pattern?: string;
  salt?: string;
  token?: string;
  admin_secret?: string;
  role?: string;
  email?: string;
  email_contact?: string;
}

/**
 * Convierte un valor a una cadena de ID, manejando ObjectIds y otros tipos.
 * @param val El valor a convertir.
 * @returns El ID como string o el valor original si la conversión falla.
 */
export function toIdString(val: any): string | any {
  if (!val) {
    return val;
  }
  if (typeof val === 'string') {
    return val;
  }
  if (val.toString) {
    return val.toString();
  }
  return val;
}

/**
 * Limpia un objeto eliminando campos internos y sensibles.
 * Normaliza el _id a una propiedad 'id' en formato string.
 * @param obj El objeto a limpiar.
 * @returns El objeto limpiado.
 */
export function cleanseObject<T extends CleanseableObject>(
  obj: T
): Omit<
  T,
  '_id' | '__v' | 'user_id' | 'password' | 'salt' | 'token' | 'admin_secret' | 'role' | 'email'
> & { id?: string } {
  if (!obj || typeof obj !== 'object') {
    return obj as any;
  }

  const copy = { ...obj } as any;

  // Normalizar y renombrar el _id a id
  if (copy._id) {
    copy.id = toIdString(copy._id);
  }

  // Eliminar campos internos y sensibles
  const internalFields = [
    '_id',
    '__v',
    'user_id',
    'password',
    'pattern',
    'salt',
    'token',
    'admin_secret',
    'role',
    'email',
  ];
  for (const key of internalFields) {
    delete copy[key];
  }

  // Convertir fechas a formato ISO para consistencia
  for (const key in copy) {
    const value = copy[key];
    if (value instanceof Date) {
      copy[key] = value.toISOString();
    }
  }

  return copy as any;
}

/**
 * Limpia un array de objetos utilizando la función cleanseObject.
 * @param arr El array de objetos a limpiar.
 * @returns El array con los objetos limpiados o un array vacío si no es un array.
 */
export function sanitizeArray<T extends CleanseableObject[]>(arr?: T): T {
  if (!Array.isArray(arr)) {
    return [] as unknown as T;
  }
  return arr.map(item => cleanseObject(item)) as T;
}

/**
 * Factory para un handler de colecciones.
 * Reduce la duplicación de código en los endpoints que cargan múltiples colecciones.
 * @param req El objeto de la solicitud.
 * @param res El objeto de la respuesta.
 * @param filter Un objeto de filtro para las colecciones (ej. { is_public: { $ne: false } }).
 * @param additionalModels Modelos adicionales a cargar.
 * @returns Un objeto con todas las colecciones.
 */
async function loadUserCollections(
  userId: string,
  filter: Record<string, any> = {},
  additionalModels: { model: any; sort: Record<string, any> }[] = []
): Promise<Record<string, any>> {
  const collectionLoaders = [
    {
      model: Project,
      select:
        'title description technologies start_date end_date project_url github_url image_url order_index',
      sort: { order_index: -1 },
    },
    {
      model: Experience,
      select: 'company position description technologies start_date end_date order_index',
      sort: { start_date: -1 },
    },
    {
      model: Education,
      select: 'institution degree field_of_study start_date end_date order_index',
      sort: { order_index: -1 },
    },
    { model: Skill, select: 'name category level order_index', sort: { order_index: -1 } },
    {
      model: Certification,
      select: 'title issuer issue_date expiry_date credential_url order_index',
      sort: { order_index: -1 },
    },
    {
      model: Testimonial,
      select: 'name position company content order_index',
      sort: { order_index: -1 },
    },
  ];

  const queries: Promise<any>[] = collectionLoaders.map(item =>
    (item.model as any)
      .find({ user_id: userId, ...(filter as any) })
      .select(item.select)
      .sort(item.sort)
      .lean()
  );

  for (const addModel of additionalModels) {
    queries.push(addModel.model.find({ user_id: userId }).sort(addModel.sort).lean());
  }

  const results: any[] = await Promise.all(queries);

  const collections = {
    projects: results[0],
    experiences: results[1],
    education: results[2],
    skills: results[3],
    certifications: results[4],
    testimonials: results[5],
  };

  if (additionalModels.length > 0) {
    // Asumimos que el último modelo añadido es el de contactos
    collections['contacts'] = results[results.length - 1];
  }

  return collections;
}

export const profileController = {
  /**
   * Obtiene el perfil público de un usuario.
   * @param req La solicitud HTTP.
   * @param res La respuesta HTTP.
   */
  getPublicProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      const user = await User.findById(userId)
        .select(
          'name about_me role_title role_subtitle linkedin_url github_url profile_image email_contact'
        )
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const collections = await loadUserCollections(userId, { is_public: { $ne: false } });

      res.json({
        ...cleanseObject(user),
        projects: sanitizeArray(collections.projects),
        experiences: sanitizeArray(collections.experiences),
        education: sanitizeArray(collections.education),
        skills: sanitizeArray(collections.skills),
        certifications: sanitizeArray(collections.certifications),
        testimonials: sanitizeArray(collections.testimonials),
      });
    } catch (error) {
      logger.error('Error al obtener perfil público:', error);
      res.status(500).json({ error: 'Error al obtener perfil público' });
    }
  },

  /**
   * Obtiene el perfil público de un usuario por su nombre de usuario.
   * @param req La solicitud HTTP.
   * @param res La respuesta HTTP.
   */
  getPublicProfileByUsername: async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      if (!username) {
        res.status(400).json({ error: 'Nombre de usuario requerido' });
        return;
      }

      const user = await User.findOne({
        $or: [
          { username },
          { email: username },
          ...(username === 'admin' ? [{ role: 'admin' }] : []),
        ],
      })
        .select(
          'name about_me status role_title role_subtitle location linkedin_url github_url profile_image username email_contact'
        )
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const sanitizedUser = cleanseObject(user);
      res.json(sanitizedUser);
    } catch (error) {
      logger.error('Error al obtener perfil público por nombre de usuario:', error);
      res.status(500).json({ error: 'Error al obtener perfil público' });
    }
  },

  /**
   * Obtiene el perfil cifrado de un usuario, combinando datos públicos y un blob cifrado.
   * @param req La solicitud HTTP.
   * @param res La respuesta HTTP.
   */
  getEncryptedProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      const user = await User.findById(userId)
        .select(
          'name email about_me status role_title role_subtitle phone location linkedin_url github_url profile_image'
        )
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const collections = await loadUserCollections(userId, { is_public: { $ne: false } });

      const fullProfile = {
        ...user,
        id: user._id,
        ...collections,
      };

      const { public: publicData, sensitive: sensitiveData } =
        DataEncryption.separateData(fullProfile);
      const sanitizedPublic = cleanseObject(publicData);
      const encryptedSensitiveData = DataEncryption.encryptSensitiveData(
        sensitiveData,
        userId,
        user.email
      );

      res.json({
        ...sanitizedPublic,
        blob: encryptedSensitiveData,
      });
    } catch (error) {
      logger.error('Error al obtener perfil cifrado:', error);
      res.status(500).json({ error: 'Error al obtener perfil cifrado' });
    }
  },

  /**
   * Obtiene el perfil completo de un usuario (requiere autenticación y ser el mismo usuario).
   * @param req La solicitud HTTP.
   * @param res La respuesta HTTP.
   */
  getFullProfile: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id: userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      if (req.user?.userId !== userId) {
        res.status(403).json({ error: 'No tienes permisos para ver este perfil completo' });
        return;
      }

      const user = await User.findById(userId)
        .select(
          'name email about_me status role_title role_subtitle phone location linkedin_url github_url profile_image'
        )
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const collections = await loadUserCollections(userId, {}, [{ model: Contact, sort: {} }]);
      const sanitizedUser = cleanseObject(user);

      res.json({
        ...sanitizedUser,
        ...Object.fromEntries(
          Object.entries(collections).map(([key, value]) => [
            key,
            sanitizeArray(value as CleanseableObject[]),
          ])
        ),
      });
    } catch (error) {
      logger.error('Error al obtener perfil completo:', error);
      res.status(500).json({ error: 'Error al obtener perfil completo' });
    }
  },

  /**
   * Obtiene el perfil de un usuario por ID.
   * @param req La solicitud HTTP.
   * @param res La respuesta HTTP.
   */
  getProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      const user = await User.findById(userId)
        .select(
          'name email about_me status role_title role_subtitle phone location linkedin_url github_url profile_image'
        )
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const sanitizedUser = cleanseObject(user);
      res.json(sanitizedUser);
    } catch (error) {
      logger.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  /**
   * Obtiene el perfil del usuario autenticado.
   * @param req La solicitud HTTP.
   * @param res La respuesta HTTP.
   */
  getAuthProfile: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'Token inválido - no userId' });
        return;
      }

      const user = await User.findById(req.user.userId)
        .select(
          'name email role last_login_at about_me status role_title role_subtitle phone location linkedin_url github_url profile_image'
        )
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json(cleanseObject(user));
    } catch (error) {
      logger.error('Error al obtener perfil autenticado:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  /**
   * Actualiza el perfil del usuario autenticado.
   * @param req La solicitud HTTP.
   * @param res La respuesta HTTP.
   */
  updateProfile: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'Token inválido' });
        return;
      }

      const updates = {
        ...req.body,
        updated_at: new Date(),
      };

      const user = await User.findByIdAndUpdate(req.user.userId, updates, {
        new: true,
        lean: true,
      }).select(
        'name email role about_me status role_title role_subtitle phone location linkedin_url github_url profile_image'
      );

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json(cleanseObject(user));
    } catch (error) {
      logger.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  },

  /**
   * Obtiene el patrón del usuario (campo de seguridad).
   * @param req La solicitud HTTP.
   * @param res La respuesta HTTP.
   */
  getPattern: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      const user = (await User.findById(userId).select('pattern').lean()) as
        | (CleanseableObject & { pattern?: string })
        | null;

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json({ pattern: user.pattern ?? null });
    } catch (error) {
      logger.error('Error al obtener pattern del perfil:', error);
      res.status(500).json({ error: 'Error al obtener pattern' });
    }
  },
};
