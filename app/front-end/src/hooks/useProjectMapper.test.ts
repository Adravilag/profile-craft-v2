import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useProjectMapper } from './useProjectMapper';
import type { Project as ApiProject } from '@/types/api';

describe('useProjectMapper', () => {
  const { result } = renderHook(() => useProjectMapper());
  const { mapItemToProject, mapProjects } = result.current;

  describe('mapItemToProject', () => {
    it('should transform basic API project to UI project', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'Test Project',
        description: 'Test description',
        technologies: ['React', 'TypeScript'],
        live_url: 'https://example.com',
        github_url: 'https://github.com/test/repo',
        image_url: 'https://example.com/image.jpg',
        status: 'active',
      };

      const result = mapItemToProject(apiProject);

      expect(result).toEqual({
        id: '1',
        title: 'Test Project',
        description: 'Test description',
        shortDescription: 'Test description',
        technologies: ['React', 'TypeScript'],
        demoUrl: 'https://example.com',
        live_url: 'https://example.com',
        repoUrl: 'https://github.com/test/repo',
        github_url: 'https://github.com/test/repo',
        video_demo_url: undefined,
        media: {
          type: 'image',
          src: 'https://example.com/image.jpg',
          poster: 'https://example.com/image.jpg',
        },
        projectType: 'Proyecto',
        type: 'Proyecto',
        status: 'active',
        projectUrl: undefined,
      });
    });

    it('should handle missing title and description', () => {
      const apiProject: ApiProject = {
        id: 2,
        technologies: [],
      };

      const result = mapItemToProject(apiProject);

      expect(result.id).toBe('2');
      expect(result.title).toBe('');
      expect(result.description).toBeUndefined();
      expect(result.shortDescription).toBeUndefined();
      expect(result.technologies).toEqual([]);
    });

    it('should convert numeric id to string', () => {
      const apiProject: ApiProject = {
        id: 123,
        title: 'Numeric ID Project',
      };

      const result = mapItemToProject(apiProject);

      expect(result.id).toBe('123');
      expect(typeof result.id).toBe('string');
    });

    it('should handle both camelCase and snake_case URL fields', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'URL Test',
        live_url: 'https://live.example.com',
        github_url: 'https://github.com/test',
      };

      const result = mapItemToProject(apiProject);

      expect(result.demoUrl).toBe('https://live.example.com');
      expect(result.live_url).toBe('https://live.example.com');
      expect(result.repoUrl).toBe('https://github.com/test');
      expect(result.github_url).toBe('https://github.com/test');
    });

    it('should handle undefined URLs gracefully', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'No URLs Project',
      };

      const result = mapItemToProject(apiProject);

      expect(result.demoUrl).toBeUndefined();
      expect(result.live_url).toBeUndefined();
      expect(result.repoUrl).toBeUndefined();
      expect(result.github_url).toBeUndefined();
    });
  });

  describe('media detection', () => {
    it('should detect video from video_demo_url', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'Video Project',
        video_demo_url: 'https://example.com/video.mp4',
        image_url: 'https://example.com/thumbnail.jpg',
      };

      const result = mapItemToProject(apiProject);

      expect(result.media).toEqual({
        type: 'video',
        src: 'https://example.com/video.mp4',
        poster: 'https://example.com/thumbnail.jpg',
      });
    });

    it('should detect video from legacy video_demo field', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'Legacy Video Project',
      };
      (apiProject as any).video_demo = 'https://example.com/legacy-video.mp4';

      const result = mapItemToProject(apiProject);

      expect(result.media).toEqual({
        type: 'video',
        src: 'https://example.com/legacy-video.mp4',
        poster: undefined,
      });
    });

    it('should detect video from image_url with video extension', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'Video as Image Project',
        image_url: 'https://example.com/video.mp4',
      };

      const result = mapItemToProject(apiProject);

      expect(result.media).toEqual({
        type: 'video',
        src: 'https://example.com/video.mp4',
        poster: undefined,
      });
    });

    it('should detect video from different video extensions', () => {
      const extensions = ['.mp4', '.webm', '.mov'];

      extensions.forEach(ext => {
        const apiProject: ApiProject = {
          id: '1',
          title: 'Video Project',
          image_url: `https://example.com/video${ext}`,
        };

        const result = mapItemToProject(apiProject);

        expect(result.media?.type).toBe('video');
        expect(result.media?.src).toBe(`https://example.com/video${ext}`);
      });
    });

    it('should ignore query parameters when detecting video extensions', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'Video with Query Project',
        image_url: 'https://example.com/video.mp4?v=123&t=456',
      };

      const result = mapItemToProject(apiProject);

      expect(result.media?.type).toBe('video');
    });

    it('should detect GIF from image_url', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'GIF Project',
        image_url: 'https://example.com/animation.gif',
      };

      const result = mapItemToProject(apiProject);

      expect(result.media).toEqual({
        type: 'gif',
        src: 'https://example.com/animation.gif',
        poster: 'https://example.com/animation.gif',
      });
    });

    it('should detect GIF with thumbnail', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'GIF with Thumbnail Project',
        image_url: 'https://example.com/animation.gif',
      };
      (apiProject as any).thumbnail = 'https://example.com/thumb.jpg';

      const result = mapItemToProject(apiProject);

      expect(result.media).toEqual({
        type: 'gif',
        src: 'https://example.com/animation.gif',
        poster: 'https://example.com/thumb.jpg',
      });
    });

    it('should default to image type', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'Image Project',
        image_url: 'https://example.com/image.jpg',
      };

      const result = mapItemToProject(apiProject);

      expect(result.media).toEqual({
        type: 'image',
        src: 'https://example.com/image.jpg',
        poster: 'https://example.com/image.jpg',
      });
    });

    it('should use fallback image when no image_url provided', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'No Image Project',
      };

      const result = mapItemToProject(apiProject);

      expect(result.media).toEqual({
        type: 'image',
        src: '/vite.svg',
        poster: undefined,
      });
    });

    it('should prefer thumbnail over image_url for poster', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'Thumbnail Project',
        image_url: 'https://example.com/image.jpg',
      };
      (apiProject as any).thumbnail = 'https://example.com/thumb.jpg';

      const result = mapItemToProject(apiProject);

      expect(result.media?.poster).toBe('https://example.com/thumb.jpg');
    });

    it('should handle thumbnail field from legacy API', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'Legacy Thumbnail Project',
      };
      (apiProject as any).thumbnail = 'https://example.com/legacy-thumb.jpg';

      const result = mapItemToProject(apiProject);

      expect(result.media).toEqual({
        type: 'image',
        src: 'https://example.com/legacy-thumb.jpg',
        poster: 'https://example.com/legacy-thumb.jpg',
      });
    });
  });

  describe('mapProjects', () => {
    it('should map array of API projects to UI projects', () => {
      const apiProjects: ApiProject[] = [
        {
          id: '1',
          title: 'Project 1',
          description: 'Description 1',
        },
        {
          id: '2',
          title: 'Project 2',
          description: 'Description 2',
        },
      ];

      const result = mapProjects(apiProjects);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('Project 1');
      expect(result[1].id).toBe('2');
      expect(result[1].title).toBe('Project 2');
    });

    it('should handle empty array', () => {
      const result = mapProjects([]);

      expect(result).toEqual([]);
    });

    it('should maintain order of projects', () => {
      const apiProjects: ApiProject[] = [
        { id: 'a', title: 'Alpha' },
        { id: 'b', title: 'Beta' },
        { id: 'c', title: 'Gamma' },
      ];

      const result = mapProjects(apiProjects);

      expect(result.map(p => p.id)).toEqual(['a', 'b', 'c']);
      expect(result.map(p => p.title)).toEqual(['Alpha', 'Beta', 'Gamma']);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null/undefined values gracefully', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: null as any,
        description: undefined,
        technologies: null as any,
        live_url: undefined,
        github_url: null as any,
      };

      const result = mapItemToProject(apiProject);

      expect(result.title).toBe('');
      expect(result.description).toBeUndefined();
      expect(result.technologies).toEqual([]);
      expect(result.demoUrl).toBeUndefined();
      expect(result.repoUrl).toBeUndefined();
    });

    it('should handle non-string image URLs', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'Non-string Image',
        image_url: null as any,
      };

      const result = mapItemToProject(apiProject);

      expect(result.media?.type).toBe('image');
      expect(result.media?.src).toBe('/vite.svg');
    });

    it('should handle malformed URLs', () => {
      const apiProject: ApiProject = {
        id: '1',
        title: 'Malformed URL Project',
        image_url: 'not-a-valid-url',
      };

      const result = mapItemToProject(apiProject);

      expect(result.media?.type).toBe('image');
      expect(result.media?.src).toBe('not-a-valid-url');
    });
  });
});
