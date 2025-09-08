import { User } from '../models/index.js';
import mongoose from 'mongoose';
import { DataEncryption } from '../utils/encryption.js';

export const profileController = {
  // Obtener perfil PÚBLICO (información limitada para portafolio)
  getPublicProfile: async (req: any, res: any): Promise<void> => {
    try {
      const userId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      // Solo información pública para el portafolio
      const user = await User.findById(userId)
        .select('name about_me role_title role_subtitle linkedin_url github_url profile_image')
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Cargar solo información pública de colecciones
      const { default: Project } = await import('../models/Project.js');
      const { default: Experience } = await import('../models/Experience.js');
      const { default: Education } = await import('../models/Education.js');
      const { default: Skill } = await import('../models/Skill.js');
      const { default: Certification } = await import('../models/Certification.js');
      const { default: Testimonial } = await import('../models/Testimonial.js');

      const [projects, experiences, education, skills, certifications, testimonials] =
        await Promise.all([
          Project.find({ user_id: userId, is_public: { $ne: false } })
            .select(
              'title description technologies start_date end_date project_url github_url image_url order_index'
            )
            .sort({ order_index: -1 })
            .lean(),
          Experience.find({ user_id: userId, is_public: { $ne: false } })
            .select('company position description technologies start_date end_date order_index')
            .sort({ start_date: -1 })
            .lean(),
          Education.find({ user_id: userId, is_public: { $ne: false } })
            .select('institution degree field_of_study start_date end_date order_index')
            .sort({ order_index: -1 })
            .lean(),
          Skill.find({ user_id: userId, is_public: { $ne: false } })
            .select('name category level order_index')
            .sort({ order_index: -1 })
            .lean(),
          Certification.find({ user_id: userId, is_public: { $ne: false } })
            .select('title issuer issue_date expiry_date credential_url order_index')
            .sort({ order_index: -1 })
            .lean(),
          Testimonial.find({ user_id: userId, is_public: { $ne: false } })
            .select('name position company content order_index')
            .sort({ order_index: -1 })
            .lean(),
        ]);

      res.json({
        id: user._id,
        name: user.name,
        about_me: user.about_me,
        role_title: user.role_title,
        role_subtitle: user.role_subtitle,
        linkedin_url: user.linkedin_url,
        github_url: user.github_url,
        profile_image: user.profile_image,
        projects,
        experiences,
        education,
        skills,
        certifications,
        testimonials,
      });
    } catch (error: any) {
      console.error('Error al obtener perfil público:', error);
      res.status(500).json({ error: 'Error al obtener perfil público' });
    }
  },

  // Obtener perfil PÚBLICO CIFRADO (datos sensibles cifrados)
  getEncryptedProfile: async (req: any, res: any): Promise<void> => {
    try {
      const userId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      // Obtener toda la información del usuario
      const user = await User.findById(userId)
        .select(
          'name email about_me status role_title role_subtitle phone location linkedin_url github_url profile_image'
        )
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Cargar colecciones relacionadas
      const { default: Project } = await import('../models/Project.js');
      const { default: Experience } = await import('../models/Experience.js');
      const { default: Education } = await import('../models/Education.js');
      const { default: Skill } = await import('../models/Skill.js');
      const { default: Certification } = await import('../models/Certification.js');
      const { default: Testimonial } = await import('../models/Testimonial.js');

      const [projects, experiences, education, skills, certifications, testimonials] =
        await Promise.all([
          Project.find({ user_id: userId, is_public: { $ne: false } })
            .select(
              'title description technologies start_date end_date project_url github_url image_url order_index'
            )
            .sort({ order_index: -1 })
            .lean(),
          Experience.find({ user_id: userId, is_public: { $ne: false } })
            .select('company position description technologies start_date end_date order_index')
            .sort({ start_date: -1 })
            .lean(),
          Education.find({ user_id: userId, is_public: { $ne: false } })
            .select('institution degree field_of_study start_date end_date order_index')
            .sort({ order_index: -1 })
            .lean(),
          Skill.find({ user_id: userId, is_public: { $ne: false } })
            .select('name category level order_index')
            .sort({ order_index: -1 })
            .lean(),
          Certification.find({ user_id: userId, is_public: { $ne: false } })
            .select('title issuer issue_date expiry_date credential_url order_index')
            .sort({ order_index: -1 })
            .lean(),
          Testimonial.find({ user_id: userId, is_public: { $ne: false } })
            .select('name position company content order_index')
            .sort({ order_index: -1 })
            .lean(),
        ]);

      const fullProfile = {
        ...user,
        id: user._id,
        projects,
        experiences,
        education,
        skills,
        certifications,
        testimonials,
      };

      // Separar datos públicos y sensibles
      const { public: publicData, sensitive: sensitiveData } =
        DataEncryption.separateData(fullProfile);

      // Cifrar solo los datos sensibles
      const encryptedSensitiveData = DataEncryption.encryptSensitiveData(
        sensitiveData,
        userId,
        user.email
      );

      res.json({
        ...publicData,
        _encrypted: encryptedSensitiveData,
        _hasEncryptedData: true,
      });
    } catch (error: any) {
      console.error('Error al obtener perfil cifrado:', error);
      res.status(500).json({ error: 'Error al obtener perfil cifrado' });
    }
  },

  // Obtener perfil completo por ID (usuario + colecciones relacionadas) - REQUIERE AUTENTICACIÓN
  getFullProfile: async (req: any, res: any): Promise<void> => {
    try {
      const userId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      // Verificar que el usuario autenticado es el mismo que está consultando
      if (req.user?.userId !== userId) {
        res.status(403).json({ error: 'No tienes permisos para ver este perfil completo' });
        return;
      }

      // Cargar usuario y colecciones relacionadas (información completa)
      const user = await User.findById(userId)
        .select(
          'name email about_me status role_title role_subtitle phone location linkedin_url github_url profile_image'
        )
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Cargar todas las colecciones relacionadas (sin filtros de privacidad)
      const { default: Project } = await import('../models/Project.js');
      const { default: Experience } = await import('../models/Experience.js');
      const { default: Education } = await import('../models/Education.js');
      const { default: Skill } = await import('../models/Skill.js');
      const { default: Certification } = await import('../models/Certification.js');
      const { default: Testimonial } = await import('../models/Testimonial.js');
      const { default: Contact } = await import('../models/Contact.js');

      const [projects, experiences, education, skills, certifications, testimonials, contacts] =
        await Promise.all([
          Project.find({ user_id: userId }).sort({ order_index: -1 }).lean(),
          Experience.find({ user_id: userId }).sort({ start_date: -1 }).lean(),
          Education.find({ user_id: userId }).sort({ order_index: -1 }).lean(),
          Skill.find({ user_id: userId }).sort({ order_index: -1 }).lean(),
          Certification.find({ user_id: userId }).sort({ order_index: -1 }).lean(),
          Testimonial.find({ user_id: userId }).sort({ order_index: -1 }).lean(),
          Contact.find({ user_id: userId }).lean(),
        ]);

      res.json({
        ...user,
        id: user._id,
        projects,
        experiences,
        education,
        skills,
        certifications,
        testimonials,
        contacts,
      });
    } catch (error: any) {
      console.error('Error al obtener perfil completo:', error);
      res.status(500).json({ error: 'Error al obtener perfil completo' });
    }
  },
  // Obtener perfil por ID
  getProfile: async (req: any, res: any): Promise<void> => {
    try {
      const userId = req.params.id;

      // Validar que el ID sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      // MongoDB-only implementation
      const user = await User.findById(userId)
        .select(
          'name email about_me status role_title role_subtitle phone location linkedin_url github_url profile_image'
        )
        .lean();

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json({
        ...user,
        id: user._id,
      });
    } catch (error: any) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }, // Obtener perfil del usuario autenticado
  getAuthProfile: async (req: any, res: any): Promise<void> => {
    try {
      console.log('🔍 getAuthProfile: Iniciando...');
      console.log('👤 Usuario del token:', req.user);
      console.log('🆔 UserID:', req.user?.userId);

      if (!req.user?.userId) {
        console.error('❌ No hay userId en el token');
        res.status(401).json({ error: 'Token inválido - no userId' });
        return;
      }

      // MongoDB-only implementation
      const user = await User.findById(req.user!.userId)
        .select(
          'name email role last_login_at about_me status role_title role_subtitle phone location linkedin_url github_url profile_image'
        )
        .lean();

      console.log('📊 Usuario encontrado:', {
        found: !!user,
        name: user?.name,
        email: user?.email,
        role_title: user?.role_title,
        hasAllFields: !!(user?.name && user?.email),
      });

      if (!user) {
        console.error('❌ Usuario no encontrado en la base de datos');
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const responseData = {
        ...user,
        id: user._id,
      };

      console.log('✅ Enviando datos del perfil:', {
        id: responseData.id,
        name: responseData.name,
        email: responseData.email,
        role_title: responseData.role_title,
        about_me: responseData.about_me?.substring(0, 50) + '...',
        hasProfileImage: !!responseData.profile_image,
      });

      res.json(responseData);
    } catch (error: any) {
      console.error('❌ Error al obtener perfil autenticado:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  // Actualizar perfil del usuario autenticado
  updateProfile: async (req: any, res: any): Promise<void> => {
    try {
      console.log('🔄 updateProfile called');
      console.log('👤 User from token:', req.user);
      console.log('📝 Request body:', req.body);

      const {
        name,
        about_me,
        status,
        role_title,
        role_subtitle,
        phone,
        location,
        linkedin_url,
        github_url,
        profile_image,
      } = req.body;

      console.log('🍃 Using MongoDB-only implementation');
      // MongoDB-only implementation
      const user = await User.findByIdAndUpdate(
        req.user!.userId,
        {
          name,
          about_me,
          status,
          role_title,
          role_subtitle,
          phone,
          location,
          linkedin_url,
          github_url,
          profile_image,
          updated_at: new Date(),
        },
        { new: true, lean: true }
      ).select(
        'name email role about_me status role_title role_subtitle phone location linkedin_url github_url profile_image'
      );

      if (!user) {
        console.log('❌ User not found in MongoDB');
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      console.log('✅ MongoDB update successful');
      res.json({
        ...user,
        id: user._id,
      });
    } catch (error: any) {
      console.error('❌ Error al actualizar perfil:', error);
      console.error('📋 Error stack:', error.stack);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  },
  // Obtener solo el campo 'pattern' público por ID (útil para trigger del login)
  getPattern: async (req: any, res: any): Promise<void> => {
    try {
      const userId = req.params.id;
      console.log('🔍 getPattern called for userId:', userId);
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      const user = await User.findById(userId).select('pattern').lean();
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json({ pattern: (user as any).pattern ?? null });
    } catch (error: any) {
      console.error('Error al obtener pattern del perfil:', error);
      res.status(500).json({ error: 'Error al obtener pattern' });
    }
  },
};
