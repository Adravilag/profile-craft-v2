import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import multer from 'multer';
import cookieParser from 'cookie-parser';

// Configuración
import { config as appConfig } from './src/config/index.js';
// import { upload } from './src/config/multer.js';
import { initializeDatabase } from './src/config/database.js';
import { initializeMongoDB } from './src/config/mongodb-init.js';

// Rutas
import authRoutes from './src/routes/auth.js';
import profileRoutes from './src/routes/profile.js';
import experiencesRoutes from './src/routes/experiences.js';
import projectsRoutes from './src/routes/projects.js';
import contactRoutes from './src/routes/contact.js';
import skillsRoutes from './src/routes/skills.js';
import mediaRoutes from './src/routes/media.js';
import educationRoutes from './src/routes/education.js';
import certificationsRoutes from './src/routes/certifications.js';
import testimonialsRoutes from './src/routes/testimonials.js';
import aboutRoutes from './src/routes/aboutRoutes.js';
import debugRoutes from './src/routes/debug.js';

// Servicios
import { readinessCheck } from './src/controllers/healthController.js';
import { securityMiddleware } from './src/middleware/security.js';
import { logger } from './src/utils/logger.js';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno ANTES de importar otros módulos
config({ path: path.join(__dirname, '.env') });

// Preparar directorio de logs para errores críticos
import fs from 'fs';
try {
  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
} catch (e) {
  logger.error('No se pudo asegurar directorio de logs:', e);
}

const serverErrorLog = path.join(path.join(__dirname, '..', 'logs'), 'server-errors.log');

const writeServerError = (prefix: string, err: any) => {
  try {
    const line = `[${new Date().toISOString()}] ${prefix} ${err && err.stack ? err.stack : String(err)}\n`;
    fs.appendFileSync(serverErrorLog, line);
  } catch (e) {
    logger.error('No se pudo escribir en server-errors.log:', e);
  }
};

process.on('uncaughtException', err => {
  logger.error('uncaughtException capturada:', err);
  writeServerError('uncaughtException:', err);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  logger.error('unhandledRejection capturada:', reason);
  writeServerError('unhandledRejection:', reason);
  process.exit(1);
});

const app = express();

// Configurar CORS de forma robusta
const allowedOrigins = appConfig.ALLOWED_ORIGINS;
logger.info('ALLOWED_ORIGINS en config:', allowedOrigins);
// Flag temporal para abrir CORS en caso de debugging (activar poniendo TEMP_OPEN_CORS=true en env)
const TEMP_OPEN_CORS = process.env.TEMP_OPEN_CORS === 'true';
if (TEMP_OPEN_CORS)
  logger.warn('⚠️ TEMP_OPEN_CORS activado: se permitirán todos los orígenes (modo DEBUG)');

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    logger.debug(`🌐 CORS check - Origin: ${origin || 'No origin'}`);
    logger.debug(`🔍 Allowed origins:`, allowedOrigins);

    // Normalizar origin entrante (quitar espacios, barra final y lowercase)
    const normalizedIncomingOrigin = origin
      ? String(origin).trim().replace(/\/$/, '').toLowerCase()
      : undefined;
    logger.debug(`🔍 Normalized incoming origin: ${normalizedIncomingOrigin || 'No origin'}`);

    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) {
      logger.debug('✅ Permitiendo request sin origin');
      return callback(null, true);
    }

    // Si TEMP_OPEN_CORS está activo, permitir todos los orígenes (modo debug)
    if (TEMP_OPEN_CORS) {
      logger.debug('⚠️ TEMP_OPEN_CORS activo - permitiendo origin:', origin);
      return callback(null, true);
    }

    // Verificar si el origin está en la lista de permitidos
    if (
      Array.isArray(allowedOrigins) &&
      normalizedIncomingOrigin &&
      allowedOrigins.includes(normalizedIncomingOrigin)
    ) {
      logger.debug(`✅ Origin ${origin} (normalized: ${normalizedIncomingOrigin}) permitido`);
      callback(null, true);
    } else {
      logger.debug(`❌ Origin ${origin} (normalized: ${normalizedIncomingOrigin}) bloqueado`);
      // En desarrollo, ser más permisivo
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('🔧 Modo desarrollo - permitiendo todos los orígenes');
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'), false);
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 horas
};

// Middlewares básicos
// Middleware manual de CORS como fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  logger.debug(`🔍 Manual CORS check - Origin: ${origin}, Method: ${req.method}`);

  const incoming = req.headers.origin as string | undefined;
  const normalizedIncoming = incoming
    ? incoming.trim().replace(/\/$/, '').toLowerCase()
    : undefined;

  // Si TEMP_OPEN_CORS está activo, permitir todos los orígenes desde el middleware manual
  if (TEMP_OPEN_CORS) {
    res.header('Access-Control-Allow-Origin', incoming || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
    );
    res.header('Access-Control-Expose-Headers', 'Content-Length, X-Foo, X-Bar');
    res.header('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      logger.debug('✅ TEMP_OPEN_CORS - respondiendo preflight');
      res.sendStatus(200);
      return;
    }
  } else if (
    (Array.isArray(allowedOrigins) &&
      normalizedIncoming &&
      allowedOrigins.includes(normalizedIncoming)) ||
    !incoming
  ) {
    res.header('Access-Control-Allow-Origin', incoming || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
    );
    res.header('Access-Control-Expose-Headers', 'Content-Length, X-Foo, X-Bar');
    res.header('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      logger.debug('✅ Respondiendo a preflight request');
      res.sendStatus(200);
      return;
    }
  }

  next();
});

app.use(cors(corsOptions));

app.use(express.json({ limit: appConfig.API_LIMITS.JSON_LIMIT }));
app.use(express.urlencoded({ limit: appConfig.API_LIMITS.URL_ENCODED_LIMIT, extended: true }));
// Permitir parseo de cookies (necesario para leer portfolio_auth_token desde req.cookies)
app.use(cookieParser());

// Middlewares de seguridad globales
app.use(securityMiddleware.removeServerHeaders);
app.use(securityMiddleware.securityHeaders);
app.use(securityMiddleware.sanitizeInput);

// Configurar directorio estático para archivos subidos
app.use('/uploads', express.static(path.join(__dirname, appConfig.FILE_UPLOAD.UPLOAD_DIR)));
// Servir archivos estáticos públicos (por ejemplo: change-admin-password.html)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/experiences', experiencesRoutes);
app.use('/api/admin/experiences', experiencesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/admin/education', educationRoutes);
app.use('/api/certifications', certificationsRoutes);
app.use('/api/admin/certifications', certificationsRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/about', aboutRoutes);
// Rutas de depuración (solo en desarrollo)
if (appConfig.isDevelopment) {
  app.use('/api/debug', debugRoutes);
}

// Health check endpoint para el frontend
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '2.0.2',
    database: process.env.MONGODB_URI ? 'MongoDB' : 'SQLite',
  });
});
// Health check endpoints
app.get('/ready', readinessCheck);
app.get('/', (req: any, res: any) => {
  res.json({
    message: 'ProfileCraft Backend API',
    version: '2.0.2',
    status: 'running',
    database: process.env.MONGODB_URI || process.env.DATABASE_URL ? 'MongoDB' : 'No database',
    corsUpdate: 'GitHub Pages CORS configuration deployed',
    corsStatus: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin || 'No origin',
      corsEnabled: true,
      manualCorsEnabled: true,
    },
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores de multer
app.use((error: any, req: any, res: any, next: any): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 10MB permitido.' });
      return;
    }
  }
  if (error instanceof Error && error.message === 'Solo se permiten archivos de imagen') {
    res.status(400).json({ error: error.message });
    return;
  }

  next(error);
});

// Función principal de inicialización
async function startServer() {
  try {
    logger.debug('🚀 Iniciando ProfileCraft Backend API v2.0...');

    // Inicializar base de datos
    const dbType = await initializeDatabase();
    logger.debug(`🗄️  Base de datos configurada: ${dbType.toUpperCase()}`);

    // Si estamos usando MongoDB, inicializar datos por defecto
    if (dbType === 'mongodb') {
      await initializeMongoDB();
    }

    // Iniciar servidor
    const server = app.listen(appConfig.PORT, '0.0.0.0', () => {
      logger.debug(`✅ ProfileCraft API corriendo en puerto ${appConfig.PORT}`);
      logger.debug(
        `📁 Directorio de uploads: ${path.join(__dirname, appConfig.FILE_UPLOAD.UPLOAD_DIR)}`
      );
      logger.debug(`🔧 Modo: ${appConfig.isDevelopment ? 'Desarrollo' : 'Producción'}`);
      logger.debug(`🌍 Entorno: ${process.env.NODE_ENV}`);
      logger.debug(`🗄️  Base de datos: ${dbType.toUpperCase()}`);

      if (appConfig.isProduction) {
        logger.debug(`🎨 Desplegado en la nube - ¡Listo para producción!`);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.debug('🛑 SIGTERM recibido, cerrando servidor...');
      server.close(() => {
        logger.debug('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

export default app;
