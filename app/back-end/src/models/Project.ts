import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  _id: string;
  user_id: string;
  title: string;
  description?: string;
  image_url?: string;
  github_url?: string;
  live_url?: string;
  project_url?: string;
  project_content?: string;
  video_demo_url?: string;
  status: string;
  order_index: number;
  type: string;
  technologies: string[];
  views: number;
  project_start_date?: Date;
  project_end_date?: Date;
  created_at: Date;
  updated_at: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    image_url: {
      type: String,
      default: null,
    },
    github_url: {
      type: String,
      default: null,
    },
    live_url: {
      type: String,
      default: null,
    },
    project_url: {
      type: String,
      default: null,
    },
    project_content: {
      type: String,
      default: null,
    },
    video_demo_url: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: 'Completado',
    },
    order_index: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      default: 'proyecto',
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    project_start_date: {
      type: Date,
      default: null,
    },
    project_end_date: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for better performance
ProjectSchema.index({ user_id: 1, order_index: -1 });
ProjectSchema.index({ user_id: 1, project_content: 1 });

const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
