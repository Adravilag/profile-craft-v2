// Proyecto: servicio para manejar visualizaciones de proyectos

import ProjectView from '../models/ProjectView.js';
import Project from '../models/Project.js';
import { Request } from 'express';

export class ProjectViewService {
  private static getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;
    if (forwarded) return forwarded.split(',')[0].trim();
    if (realIP) return realIP;
    if (remoteAddress === '::1' || remoteAddress === '::ffff:127.0.0.1') return '127.0.0.1';
    return remoteAddress || 'unknown';
  }

  static async recordView(projectId: string, req: Request): Promise<boolean> {
    try {
      const ipAddress = this.getClientIP(req);
      const userAgent = req.headers['user-agent'] || '';
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const existingView = await ProjectView.findOne({
        project_id: projectId,
        ip_address: ipAddress,
        viewed_at: { $gte: oneDayAgo },
      });

      if (existingView) return false;

      const newView = new ProjectView({
        project_id: projectId,
        ip_address: ipAddress,
        user_agent: userAgent,
        viewed_at: new Date(),
      });

      await newView.save();

      await Project.findByIdAndUpdate(projectId, { $inc: { views: 1 } }, { new: true });
      return true;
    } catch (error) {
      console.error('Error registrando vista de proyecto:', error);
      return false;
    }
  }

  static async getUniqueViews(projectId: string): Promise<number> {
    try {
      const uniqueIPs = await ProjectView.distinct('ip_address', { project_id: projectId });
      return uniqueIPs.length;
    } catch (error) {
      console.error('Error obteniendo vistas únicas:', error);
      return 0;
    }
  }

  static async getViewStats(projectId: string) {
    try {
      const totalViews = await ProjectView.countDocuments({ project_id: projectId });
      const uniqueViews = await this.getUniqueViews(projectId);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentViews = await ProjectView.countDocuments({
        project_id: projectId,
        viewed_at: { $gte: weekAgo },
      });
      const dailyViews = await ProjectView.aggregate([
        { $match: { project_id: projectId, viewed_at: { $gte: weekAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewed_at' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      return { totalViews, uniqueViews, recentViews, dailyViews };
    } catch (error) {
      console.error('Error obteniendo estadísticas de vistas:', error);
      return { totalViews: 0, uniqueViews: 0, recentViews: 0, dailyViews: [] };
    }
  }

  static async cleanOldViews(): Promise<number> {
    try {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const result = await ProjectView.deleteMany({ viewed_at: { $lt: oneYearAgo } });
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error limpiando vistas antiguas:', error);
      return 0;
    }
  }
}

export default ProjectViewService;
