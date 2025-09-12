// Test setup for ProjectForm component tests
import { vi } from 'vitest';
import type { Project } from '@/types/api';
import type { EnhancedProject } from '../types/ProjectFormTypes';

// Mock project data for testing
export const mockProject: Project = {
  id: '1',
  user_id: 'test-user-id',
  title: 'Test Project',
  description: 'Test project description',
  image_url: 'https://example.com/image.jpg',
  github_url: 'https://github.com/test/repo',
  live_url: 'https://test-project.com',
  project_url: 'https://blog.com/test-article',
  project_content: 'Test project content',
  video_demo_url: 'https://youtube.com/watch?v=test',
  status: 'Completado',
  order_index: 0,
  type: 'proyecto',
  technologies: ['React', 'TypeScript', 'Node.js'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockEnhancedProject: EnhancedProject = {
  user_id: 'test-user-id',
  title: 'Test Project',
  description: 'Test project description',
  image_url: 'https://example.com/image.jpg',
  github_url: 'https://github.com/test/repo',
  live_url: 'https://test-project.com',
  project_url: 'https://blog.com/test-article',
  project_content: 'Test project content',
  video_demo_url: 'https://youtube.com/watch?v=test',
  status: 'Completado',
  order_index: 0,
  type: 'proyecto',
  technologies: ['React', 'TypeScript', 'Node.js'],
  seo_metadata: {
    meta_title: 'Test Project - SEO Title',
    meta_description: 'Test project SEO description',
    meta_keywords: 'react, typescript, test',
    is_featured: true,
    reading_time: 5,
  },
};

export const emptyProject: EnhancedProject = {
  user_id: 'dynamic-admin-id',
  title: '',
  description: '',
  image_url: '',
  github_url: '',
  live_url: '',
  project_url: '',
  project_content: '',
  video_demo_url: '',
  status: 'En Desarrollo',
  order_index: 0,
  type: 'proyecto',
  technologies: [],
  seo_metadata: {
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_featured: false,
    reading_time: 5,
  },
};

// Mock functions for testing
export const mockProjectsApi = {
  createProject: vi.fn(),
  updateProject: vi.fn(),
  getProjectById: vi.fn(),
  getProjects: vi.fn(),
  deleteProject: vi.fn(),
  getAdminProjects: vi.fn(),
};

export const mockNotificationContext = {
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
};

export const mockNavigate = vi.fn();

// Test utilities
export const createMockFormEvent = (value: string) => ({
  target: { value },
  preventDefault: vi.fn(),
});

export const createMockKeyboardEvent = (key: string) => ({
  key,
  preventDefault: vi.fn(),
});

// Helper to reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  Object.values(mockProjectsApi).forEach(mock => mock.mockReset());
  Object.values(mockNotificationContext).forEach(mock => mock.mockReset());
  mockNavigate.mockReset();
};
