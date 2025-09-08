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

// Servicios
// import { emailService } from './src/services/emailService.js';
import { readinessCheck } from './src/controllers/healthController.js';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno ANTES de importar otros módulos
config({ path: path.join(__dirname, '.env') });

const app = express();

// Configurar CORS de forma segura
const corsOptions = {
  origin: appConfig.ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middlewares básicos
app.use(cors(corsOptions));
app.use(express.json({ limit: appConfig.API_LIMITS.JSON_LIMIT }));
app.use(express.urlencoded({ limit: appConfig.API_LIMITS.URL_ENCODED_LIMIT, extended: true }));
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
app.use('/api/admin/testimonials', testimonialsRoutes);

// Health check endpoints
app.get('/ready', readinessCheck);
app.get('/', (req: any, res: any) => {
  res.json({
    message: 'ProfileCraft Backend API',
    version: '1.0.0',
    status: 'running',
  });
});

// Middleware global de manejo de errores de multer
// Ubicado aquí para capturar errores de todos los uploads

// Manejo de errores de multer
app.use((error: any, req: any, res: any, next: any): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 10MB permitido.' });
      return;
    }
  }

  if (error.message === 'Solo se permiten archivos de imagen') {
    res.status(400).json({ error: error.message });
    return;
  }

  next(error);
});

// Función principal de inicialización
async function startServer() {
  try {
    console.log('🚀 Iniciando ProfileCraft Backend API...');

    // Inicializar base de datos
    const dbType = await initializeDatabase();
    console.log(`🗄️  Base de datos configurada: ${dbType.toUpperCase()}`);

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
        console.log(`🎨 Desplegado en Render - ¡Listo para producción!`);
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

// Middleware para rutas no encontradas (404) que responde en JSON
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

export default app;
