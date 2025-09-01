import { User, Project, Skill, Experience } from '../models/index.js';
import bcrypt from 'bcryptjs';

export const initializeMongoDB = async (): Promise<void> => {
  try {
    console.log('🌱 Inicializando datos por defecto en MongoDB...');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (!existingAdmin) {
      console.log('👤 Creando usuario admin por defecto...');

      const defaultAdmin = new User({
        name: 'Administrador',
        email: 'admin@profilecraft.com',
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
      console.log('✅ Usuario admin creado exitosamente');

      // Crear algunas habilidades por defecto
      console.log('🎯 Creando habilidades por defecto...');

      const defaultSkills = [
        {
          user_id: defaultAdmin._id,
          name: 'JavaScript',
          category: 'Frontend',
          level: 90,
          order_index: 1,
        },
        {
          user_id: defaultAdmin._id,
          name: 'TypeScript',
          category: 'Frontend',
          level: 85,
          order_index: 2,
        },
        {
          user_id: defaultAdmin._id,
          name: 'React',
          category: 'Frontend',
          level: 90,
          order_index: 3,
        },
        {
          user_id: defaultAdmin._id,
          name: 'Node.js',
          category: 'Backend',
          level: 85,
          order_index: 4,
        },
        {
          user_id: defaultAdmin._id,
          name: 'Express.js',
          category: 'Backend',
          level: 80,
          order_index: 5,
        },
        {
          user_id: defaultAdmin._id,
          name: 'MongoDB',
          category: 'Database',
          level: 75,
          order_index: 6,
        },
        { user_id: defaultAdmin._id, name: 'Git', category: 'Tools', level: 85, order_index: 7 },
      ];

      await Skill.insertMany(defaultSkills);
      console.log('✅ Habilidades por defecto creadas');

      // Crear un proyecto de ejemplo
      console.log('📁 Creando proyecto de ejemplo...');

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
      console.log('✅ Proyecto de ejemplo creado');
    } else {
      console.log('ℹ️ Usuario admin ya existe, saltando inicialización');
    }

    console.log('🎉 Inicialización de MongoDB completada');
  } catch (error) {
    console.error('❌ Error inicializando MongoDB:', error);
    throw error;
  }
};
