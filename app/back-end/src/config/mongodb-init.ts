import { User, Project, Skill } from '../models/index.js';
import { logger } from '../utils/logger.js';

export const initializeMongoDB = async (): Promise<void> => {
  try {
    logger.debug('🌱 Inicializando datos por defecto en MongoDB...');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (!existingAdmin) {
      logger.debug('👤 Creando usuario admin por defecto...');

      const defaultAdmin = new User({
        name: 'Administrador',
        email: 'admin@profilecraft.com',
        email_contact: 'contacto@profilecraft.com', // Email público para mostrar
        password: 'admin123', // Se hashea automáticamente por el middleware
        role: 'admin',
        about_me: 'Desarrollador Full Stack especializado en tecnologías modernas.',
        status: 'Disponible para proyectos',
        role_title: 'Full Stack Developer',
        role_subtitle: 'Especialista en JavaScript, TypeScript y Node.js',
        phone: '+1234567890',
        location: 'Ciudad, País',
        linkedin_url: 'https://linkedin.com/in/admin',
        github_url: 'https://github.com/admin',
      });

      await defaultAdmin.save();
      logger.debug('✅ Usuario admin creado exitosamente');

      // Crear algunas habilidades por defecto
      logger.debug('🎯 Creando habilidades por defecto...');

      const defaultSkills = [
        {
          user_id: defaultAdmin._id,
          name: 'JavaScript',
          category: 'Frontend',
          level: 90,
          order_index: 1,
          comment: '',
        },
        {
          user_id: defaultAdmin._id,
          name: 'TypeScript',
          category: 'Frontend',
          level: 85,
          order_index: 2,
          comment: '',
        },
        {
          user_id: defaultAdmin._id,
          name: 'React',
          category: 'Frontend',
          level: 90,
          order_index: 3,
          comment: '',
        },
        {
          user_id: defaultAdmin._id,
          name: 'Node.js',
          category: 'Backend',
          level: 85,
          order_index: 4,
          comment: '',
        },
        {
          user_id: defaultAdmin._id,
          name: 'Express.js',
          category: 'Backend',
          level: 80,
          order_index: 5,
          comment: '',
        },
        {
          user_id: defaultAdmin._id,
          name: 'MongoDB',
          category: 'Database',
          level: 75,
          order_index: 6,
          comment: '',
        },
        {
          user_id: defaultAdmin._id,
          name: 'Git',
          category: 'Tools',
          level: 85,
          order_index: 7,
          comment: '',
        },
      ];

      await Skill.insertMany(defaultSkills);
      logger.debug('✅ Habilidades por defecto creadas');

      // Crear un proyecto de ejemplo
      logger.debug('📁 Creando proyecto de ejemplo...');

      const defaultProject = new Project({
        user_id: defaultAdmin._id,
        title: 'ProfileCraft Backend API',
        description:
          'API backend completa para portfolio personal con autenticación JWT, gestión de proyectos y MongoDB.',
        image_url: null,
        github_url: 'https://github.com/example/profilecraft-backend',
        live_url: 'https://profilecraft-api.onrender.com',
        project_url: null,
        project_content:
          'Este es el backend completo de ProfileCraft, desarrollado con Node.js, Express, TypeScript y MongoDB. Incluye autenticación JWT, gestión de usuarios, proyectos, habilidades y experiencias laborales.',
        video_demo_url: null,
        status: 'Completado',
        order_index: 1,
        type: 'proyecto',
        technologies: ['Node.js', 'Express.js', 'TypeScript', 'MongoDB', 'JWT', 'Mongoose'],
      });

      await defaultProject.save();
      logger.debug('✅ Proyecto de ejemplo creado');
    } else {
      logger.debug('ℹ️ Usuario admin ya existe, saltando inicialización');
    }

    logger.debug('🎉 Inicialización de MongoDB completada');
  } catch (error) {
    logger.error('❌ Error inicializando MongoDB:', error);
    throw error;
  }
};
