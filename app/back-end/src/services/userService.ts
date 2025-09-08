import { User } from '../models/index.js';
import { logSentinelUsage } from './auditService.js';
import { logger } from '../utils/logger.js';

// Obtiene el ID del primer usuario con role 'admin'
export const getFirstAdminUserId = async (): Promise<string> => {
  try {
    const adminUser = await User.findOne({ role: 'admin' }).lean();
    if (adminUser && adminUser._id) {
      return adminUser._id.toString();
    }
    throw new Error('No admin user found');
  } catch (error) {
    logger.error('❌ Error obteniendo usuario admin (userService):', error);
    throw error;
  }
};

// Normaliza y resuelve sentinels como 'dynamic-admin-id' o '1' al ID real
export const resolveUserId = async (inputUserId: string | number): Promise<string> => {
  const asString = String(inputUserId);
  // Si existe ADMIN_USER_ID en env, úsala como única forma de resolver sentinels
  const adminFromEnv = process.env.ADMIN_USER_ID;
  if (adminFromEnv && adminFromEnv.trim() !== '') {
    // si el cliente pide dynamic-admin-id o admin, devolvemos el ADMIN_USER_ID
    if (asString === 'dynamic-admin-id' || asString === 'admin') {
      logger.debug(
        `🔒 Resolviendo sentinel ${asString} al ADMIN_USER_ID guardado en ENV (userService)`
      );
      try {
        await logSentinelUsage(null, { inputUserId: asString, resolvedUserId: adminFromEnv });
      } catch {
        // noop
      }
      return adminFromEnv;
    }
    return asString;
  }

  // Fallback: en ausencia de ADMIN_USER_ID, resolver 'dynamic-admin-id' y 'admin' en dev/allow-case
  const allowSentinel =
    process.env.NODE_ENV === 'development' || process.env.ALLOW_SENTINEL_ADMIN === 'true';

  if (asString === 'dynamic-admin-id' || asString === 'admin') {
    if (allowSentinel) {
      logger.debug(`🔄 Resolviendo sentinel ${asString} al primer admin (userService) (fallback)`);
      const resolved = await getFirstAdminUserId();
      try {
        await logSentinelUsage(null, { inputUserId: asString, resolvedUserId: resolved });
      } catch {
        // noop
      }
      return resolved;
    }
    logger.warn(`⚠️ ${asString} no está permitido por la configuración de entorno (userService)`);
    return asString;
  }

  // No resolvemos '1' en ningún caso: devolvemos literal y dejar que el controlador valide
  return asString;
};

export default {
  getFirstAdminUserId,
  resolveUserId,
};
