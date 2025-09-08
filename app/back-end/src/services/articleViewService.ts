// src/services/projectViewService.ts

import ProjectView from '../models/ProjectView.js';
import Project from '../models/Project.js';
import { Request } from 'express';
import { logger } from '../utils/logger';

/**
 * Servicio para manejar las visualizaciones de proyectos
 */
export class ProjectViewService {
  /**
   * Obtiene la IP real del cliente considerando proxies
   */
  private static getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;

    // Priorizar x-forwarded-for, luego x-real-ip, finalmente remoteAddress
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    // Limpiar IPv6 localhost mapping
    if (remoteAddress === '::1' || remoteAddress === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }

    return remoteAddress || 'unknown';
  }

  /**
   * Registra una vista de artículo si es única por IP en las últimas 24 horas
   */
  static async recordView(projectId: string, req: Request): Promise<boolean> {
    try {
      const ipAddress = this.getClientIP(req);
      const userAgent = req.headers['user-agent'] || '';

      // Verificar si esta IP ya vio este artículo en las últimas 24 horas
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const existingView = await ProjectView.findOne({
        project_id: projectId,
        ip_address: ipAddress,
        viewed_at: { $gte: oneDayAgo },
      });

      // Si ya hay una vista reciente de esta IP, no contar
      if (existingView) {
        return false;
      }

      // Registrar nueva vista
      const newView = new ProjectView({
        project_id: projectId,
        ip_address: ipAddress,
        user_agent: userAgent,
        viewed_at: new Date(),
      });

      await newView.save();

      // Incrementar contador en el proyecto
      await Project.findByIdAndUpdate(projectId, { $inc: { views: 1 } }, { new: true });

      return true;
    } catch (error) {
      logger.error('Error registrando vista de artículo:', error);
      return false;
    }
  }

  /**
   * Obtiene el número total de vistas únicas para un proyecto
   */
  static async getUniqueViews(projectId: string): Promise<number> {
    try {
      const uniqueIPs = await ProjectView.distinct('ip_address', {
        project_id: projectId,
      });

      return uniqueIPs.length;
    } catch (error) {
      logger.error('Error obteniendo vistas únicas:', error);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas de vistas para un proyecto
   */
  static async getViewStats(projectId: string) {
    try {
      const totalViews = await ProjectView.countDocuments({ project_id: projectId });
      const uniqueViews = await this.getUniqueViews(projectId);

      // Vistas en los últimos 7 días
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentViews = await ProjectView.countDocuments({
        project_id: projectId,
        viewed_at: { $gte: weekAgo },
      });

      // Vistas por día en la última semana
      const dailyViews = await ProjectView.aggregate([
        {
          $match: {
            project_id: projectId,
            viewed_at: { $gte: weekAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$viewed_at',
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return {
        totalViews,
        uniqueViews,
        recentViews,
        dailyViews,
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de vistas:', error);
      return {
        totalViews: 0,
        uniqueViews: 0,
        recentViews: 0,
        dailyViews: [],
      };
    }
  }

  /**
   * Limpia vistas muy antiguas (más de 1 año)
   */
  static async cleanOldViews(): Promise<number> {
    try {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

      const result = await ProjectView.deleteMany({
        viewed_at: { $lt: oneYearAgo },
      });

      return result.deletedCount || 0;
    } catch (error) {
      logger.error('Error limpiando vistas antiguas:', error);
      return 0;
    }
  }
}

export default ProjectViewService;
