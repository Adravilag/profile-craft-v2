import { Request, Response, NextFunction } from 'express';
// import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Rate limiting storage (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number; lastAttempt: number }>();
const TOKEN_BLACKLIST = new Set<string>();

export const securityMiddleware = {
  // Middleware para remover headers que exponen información del servidor
  removeServerHeaders: (req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    next();
  },

  // Middleware para agregar headers de seguridad
  securityHeaders: (req: Request, res: Response, next: NextFunction) => {
    // Prevenir clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevenir MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Strict Transport Security (solo HTTPS)
    if (req.secure || process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Content Security Policy básica
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'"
    );

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
  },

  // Rate limiting avanzado con delays progresivos
  advancedRateLimit: (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const clientId = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();

      let clientData = rateLimitStore.get(clientId);

      // Limpiar datos expirados
      if (!clientData || now > clientData.resetTime) {
        clientData = { count: 0, resetTime: now + windowMs, lastAttempt: now };
        rateLimitStore.set(clientId, clientData);
      }

      clientData.count++;
      clientData.lastAttempt = now;

      if (clientData.count > maxAttempts) {
        // Delay progresivo: 1s, 2s, 4s, 8s, etc.
        const delayMultiplier = Math.min(clientData.count - maxAttempts, 8);
        const delay = Math.pow(2, delayMultiplier) * 1000;

        logger.security(
          `🚨 Rate limit exceeded for ${clientId}. Attempt ${clientData.count}. Applying ${delay}ms delay.`
        );

        setTimeout(() => {
          res.status(429).json({
            error: 'Demasiados intentos. Intenta de nuevo más tarde.',
            retryAfter: Math.ceil(delay / 1000),
          });
        }, delay);

        return;
      }

      next();
    };
  },

  // Validación y sanitización de entrada
  sanitizeInput: (req: Request, res: Response, next: NextFunction) => {
    const sanitizeValue = (value: any): any => {
      if (typeof value === 'string') {
        // Remover scripts y tags HTML peligrosos
        return value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      }
      if (typeof value === 'object' && value !== null) {
        const sanitized: any = Array.isArray(value) ? [] : {};
        for (const key in value) {
          sanitized[key] = sanitizeValue(value[key]);
        }
        return sanitized;
      }
      return value;
    };

    if (req.body) {
      req.body = sanitizeValue(req.body);
    }
    if (req.query) {
      // Sanitizar query params sin reasignar la propiedad readonly
      const sanitizedQuery = sanitizeValue(req.query);
      Object.keys(req.query).forEach(key => {
        delete req.query[key];
      });
      Object.assign(req.query, sanitizedQuery);
    }
    if (req.params) {
      // Sanitizar params sin reasignar la propiedad readonly
      const sanitizedParams = sanitizeValue(req.params);
      Object.keys(req.params).forEach(key => {
        delete req.params[key];
      });
      Object.assign(req.params, sanitizedParams);
    }

    next();
  },

  // Validación de tamaño de payload
  limitPayloadSize: (maxSize: number = 1024 * 1024) => {
    // 1MB por defecto
    return (req: Request, res: Response, next: NextFunction): void => {
      const contentLength = parseInt(req.get('content-length') || '0');

      if (contentLength > maxSize) {
        res.status(413).json({
          error: 'Payload demasiado grande',
          maxSize: `${Math.round(maxSize / 1024)}KB`,
        });
        return;
      }

      next();
    };
  },

  /**
   * Middleware para validar origin específicamente.
   * @param allowedOrigins Array de strings con los orígenes permitidos (usualmente de config/env)
   * @returns Middleware Express que bloquea si el origin no está permitido
   */
  strictOriginValidation: (allowedOrigins: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const origin = req.get('Origin') || req.get('Referer');

      logger.debug('🔍 Manual CORS check - Origin:', origin, 'Method:', req.method);
      logger.debug('🌐 CORS check - Origin:', origin || 'No origin');
      logger.debug('🔍 Allowed origins:', allowedOrigins);

      if (!origin) {
        // Requests sin origin (ej: Postman, curl) solo en desarrollo
        if (process.env.NODE_ENV !== 'production') {
          logger.debug('✅ Permitiendo request sin origin');
          return next();
        }
        logger.security('❌ Origin requerido en producción');
        res.status(403).json({ error: 'Origin requerido' });
        return;
      }

      // Extraer origen del referer si es necesario
      let normalizedOrigin = origin;
      if (origin.includes('/') && !origin.startsWith('http')) {
        // Si referer, extraer solo el origen
        try {
          const url = new URL(origin);
          normalizedOrigin = `${url.protocol}//${url.host}`;
        } catch {
          normalizedOrigin = origin;
        }
      }

      logger.debug('🌐 Request from origin:', normalizedOrigin);
      logger.debug('🔍 Method:', req.method);
      logger.debug('📍 Path:', req.path);

      // Robustez: asegurar que allowedOrigins es array
      const isAllowed =
        Array.isArray(allowedOrigins) &&
        allowedOrigins.some(allowed => {
          try {
            // Comparación exacta primero
            if (normalizedOrigin === allowed) {
              return true;
            }

            // Comparación por URL si ambos son URLs válidas
            const originUrl = new URL(normalizedOrigin);
            const allowedUrl = new URL(allowed);

            return (
              originUrl.hostname === allowedUrl.hostname &&
              originUrl.protocol === allowedUrl.protocol &&
              originUrl.port === allowedUrl.port
            );
          } catch (error) {
            logger.warn('⚠️ Error parsing URLs:', (error as any).message);
            // Fallback a comparación de string
            return normalizedOrigin === allowed;
          }
        });

      if (!isAllowed) {
        logger.security(`🚨 Blocked request from unauthorized origin: ${normalizedOrigin}`);
        res.status(403).json({ error: 'Origin no autorizado' });
        return;
      }

      logger.debug('✅ Origin autorizado:', normalizedOrigin);
      next();
    };
  },

  // Token blacklist para logout
  addToBlacklist: (token: string) => {
    TOKEN_BLACKLIST.add(token);

    // Limpiar tokens expirados cada hora
    setTimeout(
      () => {
        TOKEN_BLACKLIST.delete(token);
      },
      60 * 60 * 1000
    );
  },

  // Verificar si un token está en blacklist
  isTokenBlacklisted: (token: string): boolean => {
    return TOKEN_BLACKLIST.has(token);
  },

  // Logging seguro de eventos de seguridad
  logSecurityEvent: (event: string, details: any, req: Request) => {
    const safeDetails = {
      ...details,
      // Remover datos sensibles
      password: details.password ? '[REDACTED]' : undefined,
      token: details.token ? '[REDACTED]' : undefined,
      secret: details.secret ? '[REDACTED]' : undefined,
    };

    logger.security(`🔒 Security Event: ${event}`, {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: safeDetails,
    });
  },
};

// Middleware específico para rutas de autenticación
export const authSecurityMiddleware = {
  // Rate limiting específico para login (más estricto)
  loginRateLimit: securityMiddleware.advancedRateLimit(3, 15 * 60 * 1000), // 3 intentos por 15 min

  // Rate limiting para registro
  registerRateLimit: securityMiddleware.advancedRateLimit(2, 60 * 60 * 1000), // 2 intentos por hora

  // Validación específica para credenciales
  validateCredentials: (req: Request, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña requeridos' });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Formato de email inválido' });
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'La contraseña debe tener entre 8 y 128 caracteres' });
      return;
    }

    next();
  },
};
