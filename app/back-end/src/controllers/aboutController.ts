import { Request, Response } from 'express';
import AboutSectionModel, { IAboutHighlight } from '../models/AboutSection.js';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

/**
 * Obtener la información completa de la sección About
 */
export const getAboutSection = async (req: Request, res: Response): Promise<void> => {
  try {
    // Buscar la sección About activa
    const aboutSection = await ((AboutSectionModel as any).findOne({ isActive: true }) as any)
      .sort({
        createdAt: -1,
      })
      .exec();

    if (!aboutSection) {
      // Si no existe, crear una sección por defecto con los datos actuales (localizados)
      const defaultAboutSection = new AboutSectionModel({
        aboutText: { es: '<p>Información sobre el desarrollador...</p>', en: '<p>Developer information...</p>' },
        highlights: [
          {
            icon: 'fas fa-laptop-code',
            title: { es: 'Arquitectura Escalable', en: 'Scalable Architecture' },
            descriptionHtml: {
              es:
                'Creo sistemas que **evolucionan junto a tus necesidades**: desde APIs RESTful hasta microservicios, cada arquitectura está pensada para ofrecer **estabilidad hoy y escalabilidad mañana**.',
              en:
                'I build systems that **evolve with your needs**: from RESTful APIs to microservices, each architecture aims to provide **stability today and scalability tomorrow**.',
            },
            tech: 'React • Node.js • SQL Server • Azure',
            imageSrc:
              'https://res.cloudinary.com/dvhcaimzt/image/upload/v1693834567/img_arquitectura_escalable_zjnb9y.png',
            imageCloudinaryId: 'img_arquitectura_escalable_zjnb9y',
            order: 1,
            isActive: true,
          },
          {
            icon: 'fas fa-mobile-alt',
            title: { es: 'Experiencias de Usuario Excepcionales', en: 'Exceptional User Experiences' },
            descriptionHtml: {
              es:
                'Diseño **interfaces claras y atractivas** que equilibran **usabilidad** y **estética**, ofreciendo experiencias digitales rápidas, consistentes y satisfactorias.',
              en:
                'I design **clear and attractive interfaces** that balance **usability** and **aesthetics**, delivering fast, consistent and satisfying digital experiences.',
            },
            tech: 'UX/UI • TypeScript • CSS3 • Responsive',
            imageSrc:
              'https://res.cloudinary.com/dvhcaimzt/image/upload/v1693834567/img_experiencias_usuario_ljyjfp.png',
            imageCloudinaryId: 'img_experiencias_usuario_ljyjfp',
            order: 2,
            isActive: true,
          },
          {
            icon: 'fas fa-rocket',
            title: { es: 'Optimización de Alto Rendimiento', en: 'High Performance Optimization' },
            descriptionHtml: {
              es:
                'Mejoro el rendimiento de aplicaciones para que sean **ágiles, estables y sin esperas innecesarias**, garantizando una experiencia de uso más satisfactoria',
              en:
                'I improve application performance to make them **fast, stable and without unnecessary wait times**, ensuring a more satisfying user experience',
            },
            tech: 'Performance • SEO • DevOps • Monitoring',
            imageSrc:
              'https://res.cloudinary.com/dvhcaimzt/image/upload/v1693834567/img_optimizacion_max_rendimiento_xw823z.png',
            imageCloudinaryId: 'img_optimizacion_max_rendimiento_xw823z',
            order: 3,
            isActive: true,
          },
        ],
        collaborationNote: {
          title: { es: '¿Tienes un proyecto desafiante?', en: 'Got a challenging project?' },
          description: {
            es:
              'Me especializo en transformar ideas complejas en soluciones digitales efectivas. Si buscas un desarrollador comprometido con la excelencia técnica, ¡conversemos sobre tu próximo proyecto!',
            en:
              'I specialize in turning complex ideas into effective digital solutions. If you are looking for a developer committed to technical excellence, let\'s talk about your next project!',
          },
          icon: '🤝',
        },
        isActive: true,
      });

      const savedAboutSection = await defaultAboutSection.save();
      res.status(200).json({
        success: true,
        data: savedAboutSection,
      });
      return;
    }

    // Ordenar highlights por el campo order
    aboutSection.highlights.sort((a: IAboutHighlight, b: IAboutHighlight) => a.order - b.order);

    res.status(200).json({
      success: true,
      data: aboutSection,
    });
  } catch (error: any) {
    logger.error('Error al obtener la sección About:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * Actualizar la información de la sección About
 */
export const updateAboutSection = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array(),
      });
      return;
    }

    const { aboutText, highlights, collaborationNote } = req.body;

    // Normalizar helper: convert a string or localized object into { es, en }
    const normalizeLocalized = (value: any) => {
      if (!value) return value;
      if (typeof value === 'string') return { es: value, en: value };
      if (typeof value === 'object' && ('es' in value || 'en' in value)) {
        return {
          es: value.es || value.en || '',
          en: value.en || value.es || '',
        };
      }
      return { es: String(value), en: String(value) };
    };

    // Normalizar highlights: title and descriptionHtml
    const normalizeHighlights = (arr: any[]) => {
      if (!Array.isArray(arr)) return arr;
      return arr.map(h => ({
        ...h,
        title: normalizeLocalized(h.title),
        descriptionHtml: normalizeLocalized(h.descriptionHtml),
      }));
    };

    // Buscar la sección About activa
    let aboutSection = await ((AboutSectionModel as any).findOne({ isActive: true }) as any).exec();

    const normalizedAboutText = normalizeLocalized(aboutText);
    const normalizedHighlights = highlights ? normalizeHighlights(highlights) : undefined;
    const normalizedCollab = collaborationNote
      ? {
          title: normalizeLocalized(collaborationNote.title),
          description: normalizeLocalized(collaborationNote.description),
          icon: collaborationNote.icon || '🤝',
        }
      : undefined;

    if (!aboutSection) {
      // Crear nueva sección si no existe
      aboutSection = new AboutSectionModel({
        aboutText: normalizedAboutText,
        highlights: normalizedHighlights || [],
        collaborationNote: normalizedCollab || undefined,
        isActive: true,
      });
    } else {
      // Actualizar la sección existente (solo campos proporcionados)
      aboutSection.aboutText = normalizedAboutText || aboutSection.aboutText;
      aboutSection.highlights = normalizedHighlights || aboutSection.highlights;
      aboutSection.collaborationNote = normalizedCollab || aboutSection.collaborationNote;
    }

    const savedAboutSection = await aboutSection.save();

    res.status(200).json({
      success: true,
      message: 'Sección About actualizada correctamente',
      data: savedAboutSection,
    });
  } catch (error: any) {
    logger.error('Error al actualizar la sección About:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * Agregar un nuevo highlight a la sección About
 */
export const addHighlight = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array(),
      });
      return;
    }

  const { icon, title, descriptionHtml, tech, imageSrc, imageCloudinaryId, order } = req.body;

    // Buscar la sección About activa
    const aboutSection = await (
      (AboutSectionModel as any).findOne({ isActive: true }) as any
    ).exec();

    if (!aboutSection) {
      res.status(404).json({
        success: false,
        message: 'Sección About no encontrada',
      });
      return;
    }

    // Normalize title/description to localized shape if necessary
    const normalizeLocalized = (value: any) => {
      if (!value) return { es: '', en: '' };
      if (typeof value === 'string') return { es: value, en: value };
      if (typeof value === 'object' && ('es' in value || 'en' in value)) {
        return { es: value.es || value.en || '', en: value.en || value.es || '' };
      }
      return { es: String(value), en: String(value) };
    };

    // Crear nuevo highlight
    const newHighlight = {
      icon,
      title: normalizeLocalized(title),
      descriptionHtml: normalizeLocalized(descriptionHtml),
      tech,
      imageSrc,
      imageCloudinaryId,
      order: order || aboutSection.highlights.length + 1,
      isActive: true,
    };

    aboutSection.highlights.push(newHighlight as any);
    const savedAboutSection = await aboutSection.save();

    res.status(201).json({
      success: true,
      message: 'Highlight agregado correctamente',
      data: savedAboutSection,
    });
  } catch (error: any) {
    logger.error('Error al agregar highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * Actualizar un highlight específico
 */
export const updateHighlight = async (req: Request, res: Response): Promise<void> => {
  try {
    const { highlightId } = req.params;
  const updateData = req.body;

    const aboutSection = await (
      (AboutSectionModel as any).findOne({ isActive: true }) as any
    ).exec();

    if (!aboutSection) {
      res.status(404).json({
        success: false,
        message: 'Sección About no encontrada',
      });
      return;
    }

    const highlight = aboutSection.highlights.id(highlightId);

    if (!highlight) {
      res.status(404).json({
        success: false,
        message: 'Highlight no encontrado',
      });
      return;
    }

    // Normalizar campos si vienen en formato legacy
    if (updateData.title) {
      highlight.title =
        typeof updateData.title === 'string'
          ? { es: updateData.title, en: updateData.title }
          : { es: updateData.title.es || updateData.title.en || '', en: updateData.title.en || updateData.title.es || '' };
    }

    if (updateData.descriptionHtml) {
      highlight.descriptionHtml =
        typeof updateData.descriptionHtml === 'string'
          ? { es: updateData.descriptionHtml, en: updateData.descriptionHtml }
          : { es: updateData.descriptionHtml.es || updateData.descriptionHtml.en || '', en: updateData.descriptionHtml.en || updateData.descriptionHtml.es || '' };
    }

    // Asignar el resto de campos (tech, imageSrc, etc.)
    const allowed = ['icon', 'tech', 'imageSrc', 'imageCloudinaryId', 'order', 'isActive'];
    for (const key of allowed) {
      if (key in updateData) (highlight as any)[key] = updateData[key];
    }
    const savedAboutSection = await aboutSection.save();

    res.status(200).json({
      success: true,
      message: 'Highlight actualizado correctamente',
      data: savedAboutSection,
    });
  } catch (error: any) {
    logger.error('Error al actualizar highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * Eliminar un highlight
 */
export const deleteHighlight = async (req: Request, res: Response): Promise<void> => {
  try {
    const { highlightId } = req.params;

    const aboutSection = await (
      (AboutSectionModel as any).findOne({ isActive: true }) as any
    ).exec();

    if (!aboutSection) {
      res.status(404).json({
        success: false,
        message: 'Sección About no encontrada',
      });
      return;
    }

    const highlightIndex = aboutSection.highlights.findIndex(
      (h: IAboutHighlight) => h._id?.toString() === highlightId
    );

    if (highlightIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Highlight no encontrado',
      });
      return;
    }

    aboutSection.highlights.splice(highlightIndex, 1);
    const savedAboutSection = await aboutSection.save();

    res.status(200).json({
      success: true,
      message: 'Highlight eliminado correctamente',
      data: savedAboutSection,
    });
  } catch (error: any) {
    logger.error('Error al eliminar highlight:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};
