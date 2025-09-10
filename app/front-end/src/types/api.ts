export interface UserProfile {
  id: number | string;
  name: string;
  email: string;
  email_contact?: string; // Email público para mostrar en el portafolio
  about_me?: string;
  status?: string;
  role_title?: string;
  role_subtitle?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  profile_image?: string;
}

export interface Experience {
  _id?: string;
  id?: string | number;
  user_id?: string | number;
  company: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  location?: string;
  header_image?: string;
  logo_image?: string;
  order_index?: number;
  technologies?: string[];
  created_at?: string;
  updated_at?: string;
}

// Unified Project type that covers both "project-like" project records and
// lightweight skill/project meta entries used elsewhere in the codebase.
export interface Project {
  id: string | number;
  user_id?: string | number;
  // Core fields
  title?: string; // used for project-like projects
  name?: string; // used for skill-like entries
  description?: string;
  summary?: string;

  // Media / links
  image_url?: string;
  thumbnail?: string;
  github_url?: string;
  live_url?: string;
  video_demo_url?: string;
  personal_repo?: string;

  // Project-specific
  project_url?: string;
  project_content?: string;
  type?: string;
  tags?: string[];
  technologies?: string[];

  // Metadata
  status?: any;
  order_index?: number;
  views?: number;
  published_at?: string;
  project_start_date?: string;
  project_end_date?: string;
  created_at?: string;
  updated_at?: string;

  // Lightweight fields used by Profile hero / skills
  category?: string;
  icon_class?: string;
  featured?: boolean;
  level?: number;
  years_experience?: number;
  notes?: string;
}

// Note: `Project` interface is declared below for backwards compatibility.

export interface Testimonial {
  _id?: string;
  id?: number | string;
  user_id?: number | string;
  name: string;
  position: string;
  avatar?: string;
  avatar_url?: string;
  text: string;
  rating?: number;
  order_index: number;
  status?: 'pending' | 'approved' | 'rejected';
  email?: string;
  company?: string;
  website?: string;
  created_at?: string;
  approved_at?: string;
  rejected_at?: string;
}

export interface Project {
  // keep Project interface for backwards compatibility; aliasing to Project
  // would also work but some code expects an Project interface declaration.
  id: string | number;
  user_id?: string | number;
  title?: string;
  description?: string;
  image_url?: string;
  github_url?: string;
  live_url?: string;
  project_url?: string;
  project_content?: string;
  video_demo_url?: string;
  status?: any;
  order_index?: number;
  type?: 'proyecto' | 'articulo' | string;
  technologies?: string[];
  summary?: string;
  meta_data?: string;
  views?: number;
  created_at?: string;
  updated_at?: string;
  project_start_date?: string;
  project_end_date?: string;
  last_read_at?: string;
}

export interface Certification {
  _id?: string;
  id?: number | string;
  user_id?: number | string;
  title: string;
  issuer: string;
  date: string;
  credential_id?: string;
  image_url?: string;
  verify_url?: string;
  course_url?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Education {
  _id?: string;
  id?: number | string;
  user_id?: number | string;
  title: string;
  institution: string;
  start_date: string;
  end_date: string;
  description?: string;
  header_image?: string;
  logo_image?: string;
  grade?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface MediaItem {
  id: number;
  url: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size?: number;
  thumbnail?: string;
  filename?: string;
  created?: Date;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file: MediaItem;
}

export interface Skill {
  id?: number | string;
  user_id?: number | string;
  name: string;
  category?: string;
  level?: number;
  years_experience?: number;
  color?: string;
  // legacy/ui fields used across the codebase
  icon_class?: string;
  featured?: boolean;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

// Backwards compatibility: many files reference a type named `article`.
// Alias `article` to `Project` so old references compile without mass refactors.
export type article = Project;
