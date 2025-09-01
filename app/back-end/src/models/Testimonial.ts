import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  position: string;
  text: string;
  email?: string;
  company?: string;
  website?: string;
  avatar?: string;
  rating?: number;
  user_id: string | mongoose.Types.ObjectId;
  order_index: number;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: Date;
  rejected_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    avatar: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
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
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approved_at: {
      type: Date,
    },
    rejected_at: {
      type: Date,
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
testimonialSchema.index({ user_id: 1, order_index: 1 });

const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);

export default Testimonial;
