import type { Project as UiProject } from '@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard';

export type MappedProject = UiProject & {
  image_url?: string;
  live_url?: string;
  github_url?: string;
  project_url?: string;
  video_demo_url?: string;
  published_at?: string;
  views?: number;
  tags?: string[];
  description?: string;
};

export const mapApiToUi = (api: any): MappedProject => {
  const id = String(api._id ?? api.id ?? (api as any).id ?? '');

  const detectMedia = () => {
    const videoUrl = api.video_demo_url || api.video_demo || undefined;
    const imageUrl = api.image_url || api.thumbnail || undefined;

    if (videoUrl)
      return { type: 'video' as const, src: videoUrl, poster: api.thumbnail ?? imageUrl };
    if (typeof imageUrl === 'string') {
      const lower = imageUrl.split('?')[0].toLowerCase();
      if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) {
        return { type: 'video' as const, src: imageUrl, poster: api.thumbnail ?? undefined };
      }
      if (lower.endsWith('.gif')) {
        return { type: 'gif' as const, src: imageUrl, poster: api.thumbnail ?? imageUrl };
      }
      return { type: 'image' as const, src: imageUrl, poster: api.thumbnail ?? imageUrl };
    }
    return undefined;
  };

  const media = detectMedia();

  return {
    id,
    title: api.title ?? '',
    shortDescription: api.description ?? undefined,
    description: api.description ?? undefined,
    technologies: api.technologies ?? [],
    demoUrl: api.live_url ?? api.demoUrl ?? undefined,
    repoUrl: api.github_url ?? api.repoUrl ?? undefined,
    media,
    // El tipo 'Artículo' ya no existe; todo se considera 'Proyecto'
    projectType: api.type ?? 'Proyecto',
    status: api.status ?? undefined,
    projectUrl: api.project_url ?? api.projectUrl ?? undefined,
    image_url: api.image_url,
    live_url: api.live_url,
    github_url: api.github_url,
    project_url: api.project_url,
    video_demo_url: api.video_demo_url,
    published_at: api.created_at ?? api.published_at,
    views: api.views,
    tags: api.tags ?? api.technologies ?? [],
  } as MappedProject;
};
