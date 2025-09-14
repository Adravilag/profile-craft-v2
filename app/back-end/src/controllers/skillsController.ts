import { Skill } from '../models/index.js';
import { logger } from '../utils/logger.js';

export const skillsController = {
  // Obtener todas las habilidades
  getSkills: async (req: any, res: any): Promise<void> => {
    try {
      // Usar el userId resuelto por el middleware, fallback a query original
      const userId = req.resolvedUserId || req.query.userId || 1;

      logger.debug('🛠️ Skills Controller - userId final:', userId);

      // MongoDB-only implementation
      const skills = await Skill.find({ user_id: userId }).sort({ order_index: 1, _id: 1 }).lean();

      res.json(
        skills.map(skill => ({
          ...skill,
          id: skill._id,
        }))
      );
    } catch (error: any) {
      logger.error('Error al obtener skills:', error);
      res.status(500).json({ error: 'Error al obtener las habilidades' });
    }
  },

  // Crear nueva habilidad
  createSkill: async (req: any, res: any): Promise<void> => {
    try {
      const { user_id, name, category, level, order_index, featured, comment } = req.body;

      if (!name || !category) {
        res.status(400).json({ error: 'Nombre y categoría son requeridos' });
        return;
      }

      // MongoDB-only implementation
      const skill = new Skill({
        user_id: user_id || 1,
        name,
        category,
        featured: typeof featured === 'boolean' ? featured : false,
        level: level || 50,
        // Normalizar comment: aceptar string (se asigna a es) o objeto { en, es }
        comment:
          typeof comment === 'string'
            ? { en: comment, es: '' }
            : comment && typeof comment === 'object'
              ? { en: comment.en || '', es: comment.es || '' }
              : { en: '', es: '' },
        order_index: order_index || 1,
      });

      await skill.save();
      logger.debug('✅ Habilidad creada exitosamente:', skill._id);

      res.status(201).json({
        ...skill.toObject(),
        id: skill._id,
      });
    } catch (error: any) {
      logger.error('Error al crear skill:', error);
      res.status(500).json({ error: 'Error al crear la habilidad' });
    }
  },

  // Actualizar habilidad
  updateSkill: async (req: any, res: any): Promise<void> => {
    try {
      logger.debug('🔄 Skills Controller - updateSkill request:', {
        id: req.params.id,
        body: req.body,
        contentType: req.headers?.['content-type'] || 'unknown',
      });

      const { name, category, level, order_index, featured, comment } = req.body;

      // Validate that at least one field is provided for update
      const hasValidFields =
        name ||
        category ||
        level !== undefined ||
        order_index !== undefined ||
        featured !== undefined ||
        comment !== undefined;

      if (!hasValidFields) {
        logger.warn('❌ Skills Controller - No valid fields provided for update');
        res.status(400).json({
          error: 'Al menos un campo debe ser proporcionado para actualizar',
          code: 'VALIDATION_ERROR',
          details: {
            message:
              'Debe proporcionar al menos uno de los siguientes campos: name, category, level, order_index, featured, comment',
          },
        });
        return;
      }

      // Check if this is a comment-only update
      const isCommentOnlyUpdate =
        comment !== undefined &&
        !name &&
        !category &&
        level === undefined &&
        order_index === undefined &&
        featured === undefined;

      // For non-comment-only updates, require name and category
      if (!isCommentOnlyUpdate && (!name || !category)) {
        logger.warn('❌ Skills Controller - Name and category required for full updates');
        res.status(400).json({
          error: 'Nombre y categoría son requeridos para actualizaciones completas',
          code: 'VALIDATION_ERROR',
          details: {
            message:
              'Para actualizaciones que no sean solo comentarios, name y category son obligatorios',
          },
        });
        return;
      }

      // Build update object with only provided fields
      const updateData: any = {
        updated_at: new Date(),
      };

      if (name) updateData.name = name;
      if (category) updateData.category = category;
      if (typeof featured === 'boolean') updateData.featured = featured;
      if (level !== undefined) updateData.level = level;
      if (order_index !== undefined) updateData.order_index = order_index;

      // Handle comment normalization
      if (comment !== undefined) {
        updateData.comment =
          typeof comment === 'string'
            ? { en: comment, es: '' }
            : comment && typeof comment === 'object'
              ? { en: comment.en || '', es: comment.es || '' }
              : { en: '', es: '' };
      }

      logger.debug('🔄 Skills Controller - Update data prepared:', updateData);

      // MongoDB-only implementation
      const skill = await Skill.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        lean: true,
      });

      if (!skill) {
        logger.warn('❌ Skills Controller - Skill not found:', req.params.id);
        res.status(404).json({
          error: 'Habilidad no encontrada',
          code: 'NOT_FOUND',
          details: {
            skillId: req.params.id,
          },
        });
        return;
      }

      logger.debug('✅ Habilidad actualizada exitosamente:', skill._id);
      res.json({
        ...skill,
        id: skill._id,
      });
    } catch (error: any) {
      logger.error('❌ Skills Controller - Error al actualizar skill:', {
        error: error.message,
        stack: error.stack,
        skillId: req.params.id,
        body: req.body,
      });

      // Handle specific MongoDB errors
      if (error.name === 'CastError') {
        res.status(400).json({
          error: 'ID de habilidad inválido',
          code: 'VALIDATION_ERROR',
          details: {
            message: 'El ID proporcionado no es válido',
          },
        });
        return;
      }

      res.status(500).json({
        error: 'Error al actualizar la habilidad',
        code: 'SERVER_ERROR',
      });
    }
  },

  // Eliminar habilidad
  deleteSkill: async (req: any, res: any): Promise<void> => {
    try {
      // MongoDB-only implementation
      const result = await Skill.findByIdAndDelete(req.params.id);

      if (!result) {
        res.status(404).json({ error: 'Habilidad no encontrada' });
        return;
      }

      logger.debug('✅ Habilidad eliminada exitosamente:', req.params.id);
      res.json({ message: 'Habilidad eliminada correctamente' });
    } catch (error: any) {
      logger.error('Error al eliminar skill:', error);
      res.status(500).json({ error: 'Error al eliminar la habilidad' });
    }
  },
};
