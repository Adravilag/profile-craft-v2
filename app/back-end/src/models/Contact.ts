import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip_address?: string;
  user_agent?: string;
  status: 'pending' | 'read' | 'responded';
  created_at: Date;
  updated_at: Date;
}

const ContactSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    ip_address: {
      type: String,
      default: null,
    },
    user_agent: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'read', 'responded'],
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for better performance
ContactSchema.index({ status: 1, created_at: -1 });
ContactSchema.index({ email: 1 });

const Contact = mongoose.model<IContact>('Contact', ContactSchema);
export default Contact;
