import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { config as appConfig } from '../config/index.js';
import { securityMiddleware } from '../middleware/security.js';
import { logger } from '../utils/logger.js';

export const debugController = {
  inspectToken: async (req: any, res: any): Promise<void> => {
    try {
      // Leer token desde cookie o header
      let token = req.cookies?.portfolio_auth_token;
      let source = 'cookie';
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
          source = 'header';
        }
      }

      if (!token) {
        res.status(400).json({ error: 'No token provided' });
        return;
      }

      // Decodificar sin verificar
      const decoded = jwt.decode(token);

      // Intentar verificar la firma
      let verified = false;
      let verifyError: any = null;
      try {
        jwt.verify(token, (appConfig as any).JWT_SECRET);
        verified = true;
      } catch (e: any) {
        verifyError = e?.message || String(e);
      }

      // Comprobar blacklist
      const blacklisted = securityMiddleware.isTokenBlacklisted(token);

      // Intentar buscar usuario y comparar tokenVersion
      let user: any = null;
      let userExists = false;
      let tokenVersionMatch: boolean | null = null;
      try {
        const payload: any = decoded as any;
        const userId = payload?.userId || payload?.user_id || null;
        if (userId) {
          user = await User.findById(userId).select('tokenVersion email role').lean();
          userExists = !!user;
          if (user) {
            tokenVersionMatch = (payload.tokenVersion || 0) === ((user as any).tokenVersion || 0);
          }
        }
      } catch (e: any) {
        logger.error('Error looking up user in debugController:', e?.message || e);
      }

      res.json({
        tokenSource: source,
        decoded,
        verified,
        verifyError,
        blacklisted,
        userExists,
        user,
        tokenVersionMatch,
      });
    } catch (error: any) {
      logger.error('Error in debugController.inspectToken:', error);
      res.status(500).json({ error: 'Internal error' });
    }
  },
  clearSecurity: async (req: any, res: any): Promise<void> => {
    try {
      // Sólo permitir en desarrollo
      if (!(appConfig as any).isDevelopment) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      if (securityMiddleware._clearRateLimitStore) securityMiddleware._clearRateLimitStore();
      if (securityMiddleware._clearTokenBlacklist) securityMiddleware._clearTokenBlacklist();

      const snapshot = securityMiddleware._getRateLimitSnapshot
        ? securityMiddleware._getRateLimitSnapshot()
        : [];

      res.json({ ok: true, cleared: true, snapshot });
    } catch (e: any) {
      logger.error('Error clearing security data:', e?.message || e);
      res.status(500).json({ ok: false, error: 'Error' });
    }
  },
};
