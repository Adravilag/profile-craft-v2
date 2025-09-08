import { Project } from '../models/index.js';
import ProjectViewService from '../services/projectViewService.js';
import { resolveUserId } from '../services/userService.js';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Usar userService para resolver user ids dinámicos

export const projectsController = {
  // Obtener proyectos

  getProjects: async (req: any, res: any): Promise<void> => {
    try {
      const inputUserId = req.query.userId || 1;
      const status = req.query.status;

      logger.debug('📰 Obteniendo proyectos para usuario:', inputUserId);

      // Resolver el userId dinámico
      const userId = await resolveUserId(inputUserId);
      logger.debug('📰 Usuario resuelto:', userId);

      // MongoDB-only implementation
      // Validar que el userId resuelto sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        logger.error('❌ ID de usuario inválido despues de resolver:', userId);
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      const filter: any = {
        user_id: new mongoose.Types.ObjectId(userId),
        project_content: { $ne: null, $exists: true },
      };

      if (status) {
        filter.status = status;
      }
      const projects = await Project.find(filter)
        .sort({ order_index: -1 })
        .select(
          'title description image_url project_url status order_index project_content technologies views created_at updated_at project_start_date project_end_date github_url live_url video_demo_url'
        )
        .lean();

      const projectsWithSummary = projects.map(project => ({
        ...project,
        id: project._id,
        summary:
          project.project_content && project.project_content.length > 200
            ? project.project_content.substring(0, 200) + '...'
            : project.project_content,
        technologies: project.technologies || [],
      }));

      logger.debug('✅ Proyectos encontrados:', projectsWithSummary.length, 'registros');
      res.json(projectsWithSummary);
    } catch (error: any) {
      logger.error('❌ Error obteniendo proyectos:', {
        message: error?.message,
        stack: error?.stack,
        query: req?.query,
        params: req?.params,
      });
      res.status(500).json({ error: 'Error al obtener proyectos' });
    }
  },
  // Obtener proyecto por ID
  getProjectById: async (req: any, res: any): Promise<void> => {
    try {
      const projectId = req.params.id;
      logger.debug('🔍 Buscando proyecto con ID:', projectId);

      // Validar que el ID sea un ObjectId válido de MongoDB
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        logger.debug('❌ ID de proyecto inválido:', projectId);
        res.status(400).json({ error: 'ID de proyecto inválido' });
        return;
      }

      // MongoDB-only implementation
      const project = await Project.findOne({
        _id: projectId,
        project_content: { $ne: null, $exists: true },
      }).lean();

      if (!project) {
        logger.debug('❌ Proyecto no encontrado con ID:', projectId);
        // Buscar si existe el proyecto sin filtro de content para diagnóstico
        const projectWithoutContent = await Project.findOne({ _id: projectId }).lean();
        if (projectWithoutContent) {
          logger.debug('ℹ️ Proyecto existe pero sin contenido válido:', projectWithoutContent);
        } else {
          logger.debug('ℹ️ Proyecto no existe en la base de datos');
        }
        res.status(404).json({ error: 'Proyecto no encontrado' });
        return;
      }

      logger.debug('✅ Proyecto encontrado:', project.title);

      // Registrar vista de forma asíncrona (no bloquear la respuesta)
      ProjectViewService.recordView(project._id.toString(), req)
        .then(recorded => {
          if (recorded) {
            logger.debug(`📊 Vista registrada para proyecto ${project._id}`);
          }
        })
        .catch(error => {
          logger.error('Error registrando vista:', error);
        });

      res.json({
        ...project,
        id: project._id,
        technologies: project.technologies || [],
      });
    } catch (error: any) {
      logger.error('Error obteniendo artículo:', {
        message: error?.message,
        stack: error?.stack,
        params: req?.params,
      });
      res.status(500).json({ error: 'Error al obtener artículo' });
    }
  },
  // ADMIN: Obtener todos los proyectos
  getAdminProjects: async (req: any, res: any): Promise<void> => {
    try {
      const inputUserId = req.query.userId || 1;

      // Resolver el userId dinámico
      const userId = await resolveUserId(inputUserId);
      logger.debug('📰 Usuario resuelto para admin projects:', userId);

      // MongoDB-only implementation
      const projects = await Project.find({ user_id: userId }).sort({ order_index: -1 }).lean();

      res.json(
        projects.map(p => ({
          ...p,
          id: p._id,
          technologies: p.technologies || [],
        }))
      );
    } catch (error: any) {
      logger.error('Error obteniendo proyectos admin:', {
        message: error?.message,
        stack: error?.stack,
        query: req?.query,
      });
      res.status(500).json({ error: 'Error al obtener proyectos' });
    }
  },
  // ADMIN: Crear proyecto
  createProject: async (req: any, res: any): Promise<void> => {
    try {
      const {
        user_id = 'dynamic-admin-id',
        title,
        description,
        image_url = null,
        github_url = null,
        live_url = null,
        project_url = null,
        project_content = null,
        video_demo_url = null,
        status = 'Completado',
        order_index = 0,
        type = 'proyecto',
        technologies = [],
      } = req.body;

      // Resolver el user_id dinámico
      const resolvedUserId = await resolveUserId(user_id);
      logger.debug('🔄 User ID resuelto para proyecto:', resolvedUserId);

      // Validar que el ID sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(resolvedUserId)) {
        res.status(400).json({ error: 'ID de usuario inválido' });
        return;
      }

      // MongoDB-only implementation
      const project = new Project({
        user_id: new mongoose.Types.ObjectId(resolvedUserId),
        title,
        description,
        image_url,
        github_url,
        live_url,
        project_url,
        project_content,
        video_demo_url,
        status,
        order_index,
        type,
        technologies: Array.isArray(technologies) ? technologies : [],
      });

      await project.save();
      logger.debug('✅ Proyecto creado exitosamente:', project._id);

      res.status(201).json({
        ...project.toObject(),
        id: project._id,
      });
    } catch (error: any) {
      logger.error('Error creando proyecto:', {
        message: error?.message,
        stack: error?.stack,
        body: req?.body,
      });
      res.status(500).json({ error: 'Error al crear proyecto' });
    }
  },

  // ADMIN: Actualizar proyecto
  updateProject: async (req: any, res: any): Promise<void> => {
    try {
      const {
        title,
        description,
        image_url,
        github_url,
        live_url,
        project_url,
        project_content,
        video_demo_url,
        status,
        order_index,
        type = 'proyecto',
        technologies = [],
      } = req.body;

      // MongoDB-only implementation
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          image_url,
          github_url,
          live_url,
          project_url,
          project_content,
          video_demo_url,
          status,
          order_index,
          type,
          technologies: Array.isArray(technologies) ? technologies : [],
          updated_at: new Date(),
        },
        { new: true, lean: true }
      );

      if (!project) {
        res.status(404).json({ error: 'Proyecto no encontrado' });
        return;
      }

      logger.debug('✅ Proyecto actualizado exitosamente:', project._id);
      res.json({
        ...project,
        id: project._id,
      });
    } catch (error: any) {
      logger.error('Error actualizando proyecto:', {
        message: error?.message,
        stack: error?.stack,
        params: req?.params,
        body: req?.body,
      });
      res.status(500).json({ error: 'Error al actualizar proyecto' });
    }
  },

  // ADMIN: Eliminar proyecto
  deleteProject: async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;

      logger.debug('🗑️ Intentando eliminar proyecto con ID:', id);

      // Validar que el ID no sea undefined o inválido
      if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
        logger.error('❌ ID de proyecto inválido:', id);
        res.status(400).json({ error: 'ID de proyecto inválido' });
        return;
      }

      // MongoDB-only implementation
      const result = await Project.findByIdAndDelete(id);

      if (!result) {
        logger.debug('❌ Proyecto no encontrado con ID:', id);
        res.status(404).json({ error: 'Proyecto no encontrado' });
        return;
      }

      logger.debug('✅ Proyecto eliminado exitosamente:', id);
      res.status(204).send();
    } catch (error: any) {
      logger.error('❌ Error eliminando proyecto:', {
        message: error?.message,
        stack: error?.stack,
        params: req?.params,
      });
      res.status(500).json({ error: 'Error al eliminar proyecto' });
    }
  },

  // Obtener estadísticas de vistas de un proyecto
  getProjectStats: async (req: any, res: any): Promise<void> => {
    try {
      const projectId = req.params.id;

      // Verificar que el proyecto existe
      const project = await Project.findById(projectId).lean();
      if (!project) {
        res.status(404).json({ error: 'Proyecto no encontrado' });
        return;
      }

      // Obtener estadísticas
      const stats = await ProjectViewService.getViewStats(projectId);

      res.json({
        projectId,
        title: project.title,
        ...stats,
      });
    } catch (error: any) {
      logger.error('Error obteniendo estadísticas:', {
        message: error?.message,
        stack: error?.stack,
        params: req?.params,
      });
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },
};
