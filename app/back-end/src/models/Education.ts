import mongoose, { Schema, Document } from 'mongoose';

export interface IEducation extends Document {
  title: string;
  institution: string;
  start_date: string;
  end_date?: string;
  description?: string;
  grade?: string;
  header_image?: string;
  logo_image?: string;
  user_id: string | mongoose.Types.ObjectId;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

const educationSchema = new Schema<IEducation>(
  {
    title: {
      // Support legacy string or localized object { es, en }
      type: Schema.Types.Mixed,
      required: true,
      trim: true,
      maxlength: 200,
    },
    institution: {
      type: Schema.Types.Mixed,
      required: true,
      trim: true,
      maxlength: 200,
    },
    start_date: {
      type: String,
      required: true,
    },
    end_date: {
      type: String,
      default: null,
    },
    description: {
      type: Schema.Types.Mixed,
      trim: true,
      maxlength: 1000,
    },
    grade: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    header_image: {
      type: String,
      trim: true,
      default: null,
    },
    logo_image: {
      type: String,
      trim: true,
      default: null,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order_index: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    // Forzar nombre de colección para mantener compatibilidad con la estructura traducida
    collection: 'education-section',
  }
);

// Índices para optimizar consultas
educationSchema.index({ user_id: 1, order_index: 1 });
educationSchema.index({ user_id: 1, start_date: -1 });

// Mantener el nombre del modelo 'Education' pero apuntando a la colección 'education-section'
const Education = mongoose.model<IEducation>('Education', educationSchema);

export default Education;
