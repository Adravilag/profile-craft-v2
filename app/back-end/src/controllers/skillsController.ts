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
      const { name, category, /* icon_class removed */ level, order_index, featured, comment } =
        req.body;

      if (!name || !category) {
        res.status(400).json({ error: 'Nombre y categoría son requeridos' });
        return;
      }

      // MongoDB-only implementation
      const skill = await Skill.findByIdAndUpdate(
        req.params.id,
        {
          name,
          category,
          featured: typeof featured === 'boolean' ? featured : undefined,
          level: level || 50,
          order_index: order_index || 1,
          // Normalizar comment para actualizar: si string, guardarlo en 'es'; si objeto, usar sus propiedades
          comment:
            typeof comment === 'string'
              ? { en: comment, es: '' }
              : comment && typeof comment === 'object'
                ? { en: comment.en || '', es: comment.es || '' }
                : undefined,
          updated_at: new Date(),
        },
        { new: true, lean: true }
      );

      if (!skill) {
        res.status(404).json({ error: 'Habilidad no encontrada' });
        return;
      }

      logger.debug('✅ Habilidad actualizada exitosamente:', skill._id);
      res.json({
        ...skill,
        id: skill._id,
      });
    } catch (error: any) {
      logger.error('Error al actualizar skill:', error);
      res.status(500).json({ error: 'Error al actualizar la habilidad' });
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
