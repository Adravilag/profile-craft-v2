/**
 * Sistema de logging seguro que automaticamente censura información sensible
 * como tokens, passwords y emails en los logs de desarrollo
 */

// Campos que contienen información sensible y deben ser censurados
const SENSITIVE_FIELDS = [
  'token',
  'authtoken',
  'authorization',
  'bearer',
  'password',
  'currentpassword',
  'newpassword',
  'passwd',
  'jwt',
  'accesstoken',
  'refreshtoken',
  'sessiontoken',
  'secret',
  'key',
  'private',
  'credential',
];

// Campos que contienen emails (se censuran parcialmente)
const EMAIL_FIELDS = ['email', 'contactemail', 'useremail', 'mail'];

// Patrón para detectar JWT tokens
const JWT_PATTERN = /^eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

/**
 * Censura parcialmente un email mostrando solo la primera letra y el dominio
 */
function sanitizeEmail(email: string): string {
  if (typeof email !== 'string' || !email.includes('@')) {
    return email;
  }

  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}

/**
 * Verifica si una clave es sensible
 */
function isSensitiveField(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some(field => lowerKey.includes(field));
}

/**
 * Verifica si una clave contiene email
 */
function isEmailField(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return EMAIL_FIELDS.some(field => lowerKey.includes(field));
}

/**
 * Sanitiza recursivamente cualquier tipo de dato, censurando información sensible
 */
export function sanitizeLogData(data: any): any {
  // Si es null o undefined, retornar tal como está
  if (data === null || data === undefined) {
    return data;
  }

  // Si es string, verificar si es un JWT o contiene información sensible
  if (typeof data === 'string') {
    if (JWT_PATTERN.test(data)) {
      return '[JWT_TOKEN_REDACTED]';
    }
    return data;
  }

  // Si es array, sanitizar cada elemento
  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  // Si es objeto, sanitizar cada propiedad
  if (typeof data === 'object') {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (isEmailField(key) && typeof value === 'string') {
        sanitized[key] = sanitizeEmail(value);
      } else if (typeof value === 'string' && JWT_PATTERN.test(value)) {
        // Verificar si el valor es un JWT, sin importar el nombre de la clave
        sanitized[key] = '[JWT_TOKEN_REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }

    return sanitized;
  }

  // Para otros tipos (number, boolean, etc.), retornar tal como está
  return data;
}

/**
 * Crea un logger seguro que automáticamente sanitiza los datos antes de loggear
 */
export function createSecureLogger(namespace: string) {
  const isProduction = import.meta.env.PROD;

  return {
    info: (...args: any[]) => {
      if (isProduction) return;

      const sanitizedArgs = args.map(arg => sanitizeLogData(arg));
      console.log(`[${namespace}]`, ...sanitizedArgs);
    },

    warn: (...args: any[]) => {
      if (isProduction) return;

      const sanitizedArgs = args.map(arg => sanitizeLogData(arg));
      console.warn(`[${namespace}]`, ...sanitizedArgs);
    },

    error: (...args: any[]) => {
      // Los errores siempre se muestran, pero sanitizados
      const sanitizedArgs = args.map(arg => sanitizeLogData(arg));
      console.error(`[${namespace}]`, ...sanitizedArgs);
    },
  };
}
