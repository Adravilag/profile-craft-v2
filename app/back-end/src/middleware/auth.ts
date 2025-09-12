// import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { securityMiddleware } from './security.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/index.js';

// Middleware de autenticación básica (cualquier usuario autenticado)
export const authenticate = async (req: any, res: any, next: any): Promise<void> => {
  // Leer token desde cookie httpOnly (preferido)
  let token = req.cookies?.portfolio_auth_token;
  let tokenSource = 'cookie';

  // Si no hay cookie, intentar token desde Authorization header (localStorage -> frontend)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      tokenSource = 'header';
    }
  }

  if (!token) {
    // Logs de ayuda en desarrollo para diagnosticar por qué no llega la cookie
    if (process.env.NODE_ENV !== 'production') {
      try {
        const origin = req.get('Origin') || req.get('Referer') || 'no-origin';
        const cookieHeader = !!req.headers?.cookie;
        const cookieKeys = Object.keys(req.cookies || {});
        const hasAuthHeader = !!req.headers.authorization;
        logger.debug(
          '[auth] Token no encontrado - Origin:',
          origin,
          'hasCookieHeader:',
          cookieHeader,
          'cookieKeys:',
          cookieKeys,
          'hasAuthHeader:',
          hasAuthHeader
        );
      } catch {
        // ignore logging errors
      }
    }

    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

  // Detectar tokens de recuperación (hex de 40 chars) accidentalmente enviados
  try {
    const rawToken =
      token && typeof token === 'string' && token.startsWith('Bearer ')
        ? token.substring(7)
        : token;
    if (rawToken && /^[0-9a-f]{40}$/i.test(rawToken)) {
      // Responder con mensaje más explicativo para clientes
      res
        .status(400)
        .json({
          error:
            'El token proporcionado parece ser un token de recuperación (hex). Use /api/auth/confirm-reset con token y email para aplicar una recuperación.',
        });
      return;
    }
  } catch (e) {
    // no bloquear por fallo en esta comprobación
  }

  // Verificar si el token está en blacklist
  if (securityMiddleware.isTokenBlacklisted(token)) {
    res.status(401).json({ error: 'Token invalidado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded) {
      res.status(403).json({ error: 'Token inválido' });
      return;
    }

    // Agregar información de origen del token para logs
    req.user = decoded as jwt.JwtPayload & { role?: string; tokenVersion?: number };
    req.tokenSource = tokenSource;

    // Si el token incluye tokenVersion, validar contra la DB para soportar invalidación
    try {
      const tokenVersionInToken = (req.user as any).tokenVersion;
      if (typeof tokenVersionInToken === 'number') {
        const userId = (req.user as any).userId;
        if (userId) {
          const user = await User.findById(userId).select('tokenVersion');
          const serverTokenVersion = user ? (user as any).tokenVersion || 0 : 0;
          if (serverTokenVersion !== tokenVersionInToken) {
            res.status(401).json({ error: 'Token invalidado' });
            return;
          }
        }
      }
    } catch (err) {
      logger.error('Error validando tokenVersion:', err);
      // En caso de error en validación, rechazamos el token por seguridad
      res.status(401).json({ error: 'Token invalidado' });
      return;
    }

    next();
  } catch (error) {
    logger.error(`Error verificando token (${tokenSource}):`, error);
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware de autenticación para administradores
export const authenticateAdmin = async (req: any, res: any, next: any): Promise<void> => {
  // Leer token desde cookie httpOnly o desde Authorization header (soporte para herramientas/API)
  let token = req.cookies?.portfolio_auth_token;
  let tokenSource = 'cookie';

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      tokenSource = 'header';
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

  // Detectar tokens de recuperación (hex) enviados por Authorization y dar feedback claro
  try {
    const rawTokenAdmin =
      token && typeof token === 'string' && token.startsWith('Bearer ')
        ? token.substring(7)
        : token;
    if (rawTokenAdmin && /^[0-9a-f]{40}$/i.test(rawTokenAdmin)) {
      res
        .status(400)
        .json({
          error:
            'El token en Authorization parece ser un token de recuperación (hex). Usa /api/auth/confirm-reset para recuperar la contraseña.',
        });
      return;
    }
  } catch (e) {}

  // Verificar si el token está en blacklist
  if (securityMiddleware.isTokenBlacklisted(token)) {
    res.status(401).json({ error: 'Token invalidado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded || (decoded as any).role !== 'admin') {
      res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
      return;
    }
    req.user = decoded as jwt.JwtPayload & { role?: string; tokenVersion?: number };
    req.tokenSource = tokenSource;

    try {
      const tokenVersionInToken = (req.user as any).tokenVersion;
      if (typeof tokenVersionInToken === 'number') {
        const userId = (req.user as any).userId;
        if (userId) {
          const user = await User.findById(userId).select('tokenVersion');
          const serverTokenVersion = user ? (user as any).tokenVersion || 0 : 0;
          if (serverTokenVersion !== tokenVersionInToken) {
            res.status(401).json({ error: 'Token invalidado' });
            return;
          }
        }
      }
    } catch (err) {
      logger.error('Error validando tokenVersion admin:', err);
      res.status(401).json({ error: 'Token invalidado' });
      return;
    }

    next();
  } catch (error) {
    logger.error('❌ Error verificando token admin:', error);
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware opcional: si existe token intenta decodificar y setear req.user,
// pero no falla si no hay token (útil para endpoints públicos que quieren
// conocer al usuario si está autenticado sin exigirlo).
export const optionalAuth = async (req: any, res: any, next: any): Promise<void> => {
  // Leer token desde cookie httpOnly (preferido) o Authorization header
  let token = req.cookies?.portfolio_auth_token;
  let tokenSource = 'cookie';

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      tokenSource = 'header';
    }
  }

  if (!token) {
    // No hay token: continuar sin error
    return next();
  }

  // Si el token está en blacklist, no bloquear: simplemente continuar
  if (securityMiddleware.isTokenBlacklisted(token)) {
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('[optionalAuth] token en blacklist, continuando sin usuario');
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded) {
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('[optionalAuth] token inválido al intentar decodificar');
      }
      return next();
    }
    req.user = decoded as jwt.JwtPayload & { role?: string; tokenVersion?: number };
    req.tokenSource = tokenSource;

    try {
      const tokenVersionInToken = (req.user as any).tokenVersion;
      if (typeof tokenVersionInToken === 'number') {
        const userId = (req.user as any).userId;
        if (userId) {
          const user = await User.findById(userId).select('tokenVersion');
          const serverTokenVersion = user ? (user as any).tokenVersion || 0 : 0;
          if (serverTokenVersion !== tokenVersionInToken) {
            if (process.env.NODE_ENV !== 'production') {
              logger.debug('[optionalAuth] token invalidado por tokenVersion mismatch');
            }
            return next();
          }
        }
      }
    } catch (err) {
      logger.error('Error validando tokenVersion optional:', err);
      return next();
    }

    return next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      logger.error(
        `[optionalAuth] error verificando token (${tokenSource}):`,
        (error as any)?.message || error
      );
    }
    return next();
  }
};
