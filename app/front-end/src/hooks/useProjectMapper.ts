import { useCallback } from 'react';
import type { Project as ApiProject } from '@/types/api';
import type { Project as UiProject } from '@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard';

type MediaType = 'video' | 'image' | 'gif';

interface MediaResult {
  type: MediaType;
  src: string;
  poster?: string;
}

export interface UseProjectMapperReturn {
  mapItemToProject: (item: ApiProject) => UiProject;
  mapProjects: (items: ApiProject[]) => UiProject[];
}

/**
 * Custom hook for transforming API projects to UI-compatible format
 * Handles media detection and data normalization
 */
export const useProjectMapper = (): UseProjectMapperReturn => {
  /**
   * Detects media type and extracts appropriate URLs from project data
   */
  const detectMedia = useCallback((item: ApiProject): MediaResult => {
    const videoUrl = (item as any).video_demo_url || (item as any).video_demo || undefined;
    const imageUrl = item.image_url || (item as any).thumbnail || undefined;

    // Check for video URL first
    if (videoUrl) {
      return {
        type: 'video',
        src: videoUrl,
        poster: (item as any).thumbnail || imageUrl,
      };
    }

    // Check if image URL is actually a video file
    if (typeof imageUrl === 'string') {
      const lower = imageUrl.split('?')[0].toLowerCase();
      if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) {
        return {
          type: 'video',
          src: imageUrl,
          poster: (item as any).thumbnail || undefined,
        };
      }
      if (lower.endsWith('.gif')) {
        return {
          type: 'gif',
          src: imageUrl,
          poster: (item as any).thumbnail || imageUrl,
        };
      }
    }

    // Default to image
    return {
      type: 'image',
      src: imageUrl || '/vite.svg',
      poster: (item as any).thumbnail || imageUrl,
    };
  }, []);

  /**
   * Maps an API project to UI project format
   */
  const mapItemToProject = useCallback(
    (item: ApiProject): UiProject => {
      const isProject = true; // all items are considered projects now
      const projectType = 'Proyecto';
      const canonicalPath = `/profile-craft/projects/${item.id}`;

      return {
        id: String(item.id),
        title: String(item.title ?? ''),
        // map both description and shortDescription for the UI component
        description: String(item.description ?? '') || undefined,
        shortDescription: String(item.description ?? '') || undefined,
        technologies: item.technologies || [],
        // expose both camelCase and snake_case urls for compatibility
        demoUrl: item.live_url ? String(item.live_url) : undefined,
        live_url: item.live_url ? String(item.live_url) : undefined,
        repoUrl: item.github_url ? String(item.github_url) : undefined,
        github_url: item.github_url ? String(item.github_url) : undefined,
        video_demo_url: (item as any).video_demo_url || (item as any).video_demo || undefined,
        media: detectMedia(item) as any,
        projectType: projectType,
        // prefer `type` property as human readable project type; keep `projectType` too
        type: projectType,
        status: item.status as any,
        projectUrl: !isProject ? canonicalPath : undefined,
      } as UiProject;
    },
    [detectMedia]
  );

  /**
   * Maps an array of API projects to UI projects format
   */
  const mapProjects = useCallback(
    (items: ApiProject[]): UiProject[] => {
      return items.map(mapItemToProject);
    },
    [mapItemToProject]
  );

  return {
    mapItemToProject,
    mapProjects,
  };
};

export default useProjectMapper;
