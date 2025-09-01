import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import multer from 'multer';
import cookieParser from 'cookie-parser';

// Configuración
import { config as appConfig } from './src/config/index.js';
import { upload } from './src/config/multer.js';
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

// Servicios
import { emailService } from './src/services/emailService.js';
import { healthCheck, readinessCheck } from './src/controllers/healthController.js';

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
  console.error('No se pudo asegurar directorio de logs:', e);
}

const serverErrorLog = path.join(path.join(__dirname, '..', 'logs'), 'server-errors.log');

const writeServerError = (prefix: string, err: any) => {
  try {
    const line = `[${new Date().toISOString()}] ${prefix} ${err && err.stack ? err.stack : String(err)}\n`;
    fs.appendFileSync(serverErrorLog, line);
  } catch (e) {
    console.error('No se pudo escribir en server-errors.log:', e);
  }
};

process.on('uncaughtException', err => {
  console.error('uncaughtException capturada:', err);
  writeServerError('uncaughtException:', err);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  console.error('unhandledRejection capturada:', reason);
  writeServerError('unhandledRejection:', reason);
  process.exit(1);
});

const app = express();

// Configurar CORS de forma robusta
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'https://adravilag.github.io',
  'https://adravilag.github.io/profile-craft',
  'https://adravilag.github.io/ProfileCraft',
  'https://adravilag.github.io/cv-maker',
  'https://profilecraft.onrender.com',
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    console.log(`🌐 CORS check - Origin: ${origin || 'No origin'}`);
    console.log(`🔍 Allowed origins:`, allowedOrigins);

    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ Permitiendo request sin origin');
      return callback(null, true);
    }

    // Verificar si el origin está en la lista de permitidos
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Origin ${origin} permitido`);
      callback(null, true);
    } else {
      console.log(`❌ Origin ${origin} bloqueado`);
      // En desarrollo, ser más permisivo
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Modo desarrollo - permitiendo todos los orígenes');
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
  console.log(`🔍 Manual CORS check - Origin: ${origin}, Method: ${req.method}`);

  if (allowedOrigins.includes(origin as string) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
    );
    res.header('Access-Control-Expose-Headers', 'Content-Length, X-Foo, X-Bar');
    res.header('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      console.log('✅ Respondiendo a preflight request');
      res.sendStatus(200);
      return;
    }
  }

  next();
});

app.use(cors(corsOptions));

// Middleware adicional para debug de CORS
app.use((req, res, next) => {
  console.log(`🌐 Request from origin: ${req.headers.origin || 'No origin'}`);
  console.log(`🔍 Method: ${req.method}`);
  console.log(`📍 Path: ${req.path}`);
  next();
});

app.use(express.json({ limit: appConfig.API_LIMITS.JSON_LIMIT }));
app.use(express.urlencoded({ limit: appConfig.API_LIMITS.URL_ENCODED_LIMIT, extended: true }));
// Permitir parseo de cookies (necesario para leer portfolio_auth_token desde req.cookies)
app.use(cookieParser());

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

// Health check endpoints
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);
app.get('/', (req: any, res: any) => {
  res.json({
    message: 'ProfileCraft Backend API',
    version: '2.0.2',
    status: 'running',
    database: process.env.MONGODB_URI ? 'MongoDB' : 'SQLite',
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

// DEBUG: Endpoint temporal para obtener información del usuario admin
app.get('/debug/admin-user', async (req: any, res: any) => {
  try {
    const { User } = await import('./src/models/index.js');
    const adminUser = await User.findOne({ role: 'admin' });

    if (adminUser) {
      res.json({
        success: true,
        user: {
          id: adminUser._id.toString(),
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
        },
      });
    } else {
      res.json({
        success: false,
        message: 'No se encontró usuario admin',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
});

// Endpoint temporal y protegido para cambiar la contraseña de un usuario vía POST
// SOLO DISPONIBLE EN DESARROLLO por seguridad
// Requiere la cabecera 'x-admin-secret' que debe coincidir con process.env.ADMIN_SECRET
if (process.env.NODE_ENV !== 'production') {
  app.post('/debug/change-password', async (req: any, res: any) => {
    try {
      const secretHeader = (req.headers['x-admin-secret'] || req.headers['X-Admin-Secret']) as
        | string
        | undefined;
      const configuredSecret = process.env.ADMIN_SECRET;

      if (!configuredSecret) {
        return res
          .status(500)
          .json({ success: false, message: 'ADMIN_SECRET no está configurado en el servidor' });
      }

      if (!secretHeader || secretHeader !== configuredSecret) {
        return res
          .status(401)
          .json({ success: false, message: 'Cabecera x-admin-secret inválida o ausente' });
      }

      const { email, id, password } = req.body || {};

      if (!password || (!email && !id)) {
        return res
          .status(400)
          .json({ success: false, message: 'Se requiere password y email o id en el body' });
      }

      const { User } = await import('./src/models/index.js');

      const query: any = {};
      if (email) query.email = email;
      if (id) query._id = id;

      const user = await User.findOne(query);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      // Asignar la nueva contraseña en texto y guardar para que el pre-save del modelo la hashee
      user.password = password;
      await user.save();

      return res.json({
        success: true,
        message: 'Contraseña actualizada correctamente',
        user: { id: user._id.toString(), email: user.email },
      });
    } catch (error) {
      console.error('Error en /debug/change-password:', error);
      return res
        .status(500)
        .json({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
  });
}

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
    console.log('🚀 Iniciando ProfileCraft Backend API v2.0...');

    // Inicializar base de datos
    const dbType = await initializeDatabase();
    console.log(`🗄️  Base de datos configurada: ${dbType.toUpperCase()}`);

    // Si estamos usando MongoDB, inicializar datos por defecto
    if (dbType === 'mongodb') {
      await initializeMongoDB();
    }

    // Iniciar servidor
    const server = app.listen(appConfig.PORT, '0.0.0.0', () => {
      console.log(`✅ ProfileCraft API corriendo en puerto ${appConfig.PORT}`);
      console.log(
        `📁 Directorio de uploads: ${path.join(__dirname, appConfig.FILE_UPLOAD.UPLOAD_DIR)}`
      );
      console.log(`🔧 Modo: ${appConfig.isDevelopment ? 'Desarrollo' : 'Producción'}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Base de datos: ${dbType.toUpperCase()}`);

      if (appConfig.isProduction) {
        console.log(`🎨 Desplegado en la nube - ¡Listo para producción!`);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM recibido, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

export default app;
