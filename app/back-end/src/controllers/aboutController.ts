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
      // Si no existe, crear una sección por defecto con los datos actuales
      const defaultAboutSection = new AboutSectionModel({
        aboutText: '<p>Información sobre el desarrollador...</p>',
        highlights: [
          {
            icon: 'fas fa-laptop-code',
            title: 'Arquitectura Escalable',
            descriptionHtml:
              'Creo sistemas que **evolucionan junto a tus necesidades**: desde APIs RESTful hasta microservicios, cada arquitectura está pensada para ofrecer **estabilidad hoy y escalabilidad mañana**.',
            tech: 'React • Node.js • SQL Server • Azure',
            imageSrc:
              'https://res.cloudinary.com/dvhcaimzt/image/upload/v1693834567/img_arquitectura_escalable_zjnb9y.png',
            imageCloudinaryId: 'img_arquitectura_escalable_zjnb9y',
            order: 1,
            isActive: true,
          },
          {
            icon: 'fas fa-mobile-alt',
            title: 'Experiencias de Usuario Excepcionales',
            descriptionHtml:
              'Diseño **interfaces claras y atractivas** que equilibran **usabilidad** y **estética**, ofreciendo experiencias digitales rápidas, consistentes y satisfactorias.',
            tech: 'UX/UI • TypeScript • CSS3 • Responsive',
            imageSrc:
              'https://res.cloudinary.com/dvhcaimzt/image/upload/v1693834567/img_experiencias_usuario_ljyjfp.png',
            imageCloudinaryId: 'img_experiencias_usuario_ljyjfp',
            order: 2,
            isActive: true,
          },
          {
            icon: 'fas fa-rocket',
            title: 'Optimización de Alto Rendimiento',
            descriptionHtml:
              'Mejoro el rendimiento de aplicaciones para que sean **ágiles, estables y sin esperas innecesarias**, garantizando una experiencia de uso más satisfactoria',
            tech: 'Performance • SEO • DevOps • Monitoring',
            imageSrc:
              'https://res.cloudinary.com/dvhcaimzt/image/upload/v1693834567/img_optimizacion_max_rendimiento_xw823z.png',
            imageCloudinaryId: 'img_optimizacion_max_rendimiento_xw823z',
            order: 3,
            isActive: true,
          },
        ],
        collaborationNote: {
          title: '¿Tienes un proyecto desafiante?',
          description:
            'Me especializo en transformar ideas complejas en soluciones digitales efectivas. Si buscas un desarrollador comprometido con la excelencia técnica, ¡conversemos sobre tu próximo proyecto!',
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

    // Buscar la sección About activa
    let aboutSection = await ((AboutSectionModel as any).findOne({ isActive: true }) as any).exec();

    if (!aboutSection) {
      // Crear nueva sección si no existe
      aboutSection = new AboutSectionModel({
        aboutText,
        highlights,
        collaborationNote,
        isActive: true,
      });
    } else {
      // Actualizar la sección existente
      aboutSection.aboutText = aboutText || aboutSection.aboutText;
      aboutSection.highlights = highlights || aboutSection.highlights;
      aboutSection.collaborationNote = collaborationNote || aboutSection.collaborationNote;
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

    // Crear nuevo highlight
    const newHighlight = {
      icon,
      title,
      descriptionHtml,
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

    // Actualizar campos del highlight
    Object.assign(highlight, updateData);
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
