import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger';

// Construir ruta de logs relativa al archivo actual para evitar problemas de cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '..', '..', 'logs');
const auditLog = path.join(logsDir, 'audit.log');

try {
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
} catch (e) {
  logger.error('No se pudo crear directorio de logs:', e);
}

export const logSentinelUsage = async (
  req: any,
  info: { inputUserId?: string; resolvedUserId?: string; action?: string }
) => {
  try {
    const entry = {
      time: new Date().toISOString(),
      action: info.action || 'resolve-sentinel',
      route: req?.originalUrl || req?.url || 'unknown',
      method: req?.method || 'GET',
      ip: req?.ip || req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null,
      inputUserId: info.inputUserId || null,
      resolvedUserId: info.resolvedUserId || null,
    };

    const line = JSON.stringify(entry) + '\n';
    // Log to console
    logger.debug('📋 AUDIT:', entry);
    // Append to audit log file (best-effort)
    fs.appendFile(auditLog, line, err => {
      if (err) logger.error('Error escribiendo audit log:', err);
    });
  } catch (error) {
    logger.error('Error en logSentinelUsage:', error);
  }
};

export default { logSentinelUsage };
