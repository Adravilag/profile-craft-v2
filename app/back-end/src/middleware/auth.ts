// import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { securityMiddleware } from './security.js';
import { logger } from '../utils/logger.js';

// Middleware de autenticación básica (cualquier usuario autenticado)
export const authenticate = (req: any, res: any, next: any): void => {
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
    req.user = decoded as jwt.JwtPayload & { role?: string };
    req.tokenSource = tokenSource;

    next();
  } catch (error) {
    logger.error(`Error verificando token (${tokenSource}):`, error);
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware de autenticación para administradores
export const authenticateAdmin = (req: any, res: any, next: any): void => {
  // Leer token desde cookie httpOnly
  const token = req.cookies?.portfolio_auth_token;

  if (!token) {
    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

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
    req.user = decoded as jwt.JwtPayload & { role?: string };
    next();
  } catch (error) {
    logger.error('❌ Error verificando token admin:', error);
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware opcional: si existe token intenta decodificar y setear req.user,
// pero no falla si no hay token (útil para endpoints públicos que quieren
// conocer al usuario si está autenticado sin exigirlo).
export const optionalAuth = (req: any, res: any, next: any): void => {
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
    req.user = decoded as jwt.JwtPayload & { role?: string };
    req.tokenSource = tokenSource;
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
