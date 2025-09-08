import { User } from '../models/index.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware para resolver identificadores públicos a IDs de base de datos
 * Permite usar aliases públicos sin exponer las IDs reales
 */
export const resolvePublicId = async (req: any, res: any, next: any): Promise<void> => {
  try {
    const publicId = req.params.id;

    if (!publicId) {
      res.status(400).json({ error: 'ID público requerido' });
      return;
    }

    let realUserId: string;

    // 1. Si es un ObjectId válido de MongoDB, úsalo directamente
    if (/^[0-9a-fA-F]{24}$/.test(publicId)) {
      realUserId = publicId;
    }
    // 2. Si es el alias público 'admin', buscar el usuario admin
    else if (publicId === 'admin') {
      const adminUser = await User.findOne({ role: 'admin' }).select('_id').lean();
      if (!adminUser) {
        res.status(404).json({ error: 'Usuario administrador no encontrado' });
        return;
      }
      realUserId = adminUser._id.toString();
    }
    // 3. Si es el alias 'dynamic-admin-id', usar la variable de entorno
    else if (publicId === 'dynamic-admin-id') {
      realUserId = process.env.ADMIN_USER_ID || '';
      if (!realUserId) {
        res.status(404).json({ error: 'ID de administrador no configurado' });
        return;
      }
    }
    // 4. Buscar por username
    else {
      const user = await User.findOne({ username: publicId }).select('_id').lean();
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      realUserId = user._id.toString();
    }

    // Agregar la ID real al request para que los controladores la usen
    req.resolvedUserId = realUserId;
    req.originalPublicId = publicId;

    // Opcional: para debugging
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`🔄 [resolvePublicId] ${publicId} → ${realUserId}`);
    }

    next();
  } catch (error: any) {
    logger.error('Error resolviendo ID público:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Middleware específico para el endpoint de perfil público
 * Mapea el alias 'admin' al ID del usuario administrador
 */
export const resolveAdminAlias = async (req: any, res: any, next: any): Promise<void> => {
  try {
    const identifier = req.params.id || req.params.username;

    if (identifier === 'admin') {
      // Buscar el usuario admin real
      const adminUser = await User.findOne({ role: 'admin' }).select('_id').lean();
      if (!adminUser) {
        res.status(404).json({ error: 'Usuario administrador no encontrado' });
        return;
      }

      // Reemplazar el parámetro con la ID real
      req.params.id = adminUser._id.toString();
      req.resolvedUserId = adminUser._id.toString();
      req.isAdminAlias = true;

      if (process.env.NODE_ENV !== 'production') {
        logger.debug(`🔄 [resolveAdminAlias] admin → ${adminUser._id.toString()}`);
      }
    }

    next();
  } catch (error: any) {
    logger.error('Error resolviendo alias de admin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Middleware para resolver userId en query parameters
 * Convierte 'admin' a la ID real del usuario administrador
 */
export const resolveUserIdQuery = async (req: any, res: any, next: any): Promise<void> => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      next();
      return;
    }

    let realUserId: string;

    // 1. Si es un ObjectId válido de MongoDB, úsalo directamente
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      realUserId = userId;
    }
    // 2. Si es el alias público 'admin', buscar el usuario admin
    else if (userId === 'admin') {
      const adminUser = await User.findOne({ role: 'admin' }).select('_id').lean();
      if (!adminUser) {
        res.status(404).json({ error: 'Usuario administrador no encontrado' });
        return;
      }
      realUserId = adminUser._id.toString();
    }
    // 3. Si es el alias 'dynamic-admin-id', usar la variable de entorno
    else if (userId === 'dynamic-admin-id') {
      realUserId = process.env.ADMIN_USER_ID || '';
      if (!realUserId) {
        res.status(404).json({ error: 'ID de administrador no configurado' });
        return;
      }
    }
    // 4. Si es un número (legacy), búscalo como user_id
    else if (/^\d+$/.test(userId)) {
      realUserId = userId; // Mantener compatibilidad con IDs numéricas
    }
    // 5. Buscar por username
    else {
      const user = await User.findOne({ username: userId }).select('_id').lean();
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      realUserId = user._id.toString();
    }

    // Reemplazar el query parameter con la ID real
    req.query.userId = realUserId;
    req.resolvedUserId = realUserId;
    req.originalPublicUserId = userId;

    // Opcional: para debugging
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`🔄 [resolveUserIdQuery] ${userId} → ${realUserId}`);
    }

    next();
  } catch (error: any) {
    logger.error('Error resolviendo userId en query:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const publicIdMiddleware = {
  resolvePublicId,
  resolveAdminAlias,
  resolveUserIdQuery,
};
