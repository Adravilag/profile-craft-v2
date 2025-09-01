import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  _id: string;
  user_id: string;
  company: string;
  position: string;
  description?: string;
  start_date: Date;
  end_date?: Date;
  is_current: boolean;
  location?: string;
  header_image?: string;
  logo_image?: string;
  order_index: number;
  technologies: string[];
  created_at: Date;
  updated_at: Date;
}

const ExperienceSchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      default: null,
    },
    is_current: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: null,
    },
    header_image: {
      type: String,
      default: null,
    },
    logo_image: {
      type: String,
      default: null,
    },
    order_index: {
      type: Number,
      default: 0,
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for better performance
ExperienceSchema.index({ user_id: 1, order_index: 1 });
ExperienceSchema.index({ user_id: 1, start_date: -1 });

const Experience = mongoose.model<IExperience>('Experience', ExperienceSchema);
export default Experience;
