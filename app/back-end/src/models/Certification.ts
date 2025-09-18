import mongoose, { Schema, Document } from 'mongoose';

export interface ICertification extends Document {
  title: string;
  issuer: string;
  date: string;
  technologies?: string[];
  credential_id?: string;
  image_url?: string;
  verify_url?: string;
  course_url?: string;
  user_id: string | mongoose.Types.ObjectId;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

const certificationSchema = new Schema<ICertification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    date: {
      type: String,
      required: true,
    },
    credential_id: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    image_url: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    verify_url: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    course_url: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    technologies: {
      type: [String],
      default: [],
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
  }
);

// Índices para optimizar consultas
certificationSchema.index({ user_id: 1, order_index: 1 });
certificationSchema.index({ user_id: 1, date: -1 });

const Certification = mongoose.model<ICertification>('Certification', certificationSchema);

export default Certification;
