import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  email_contact?: string; // Email público para mostrar en el portafolio
  password: string;
  role: 'user' | 'admin';
  about_me?: string;
  status?: string;
  role_title?: string;
  role_subtitle?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  profile_image?: string;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email_contact: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    about_me: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: null,
    },
    role_title: {
      type: String,
      default: null,
    },
    role_subtitle: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    linkedin_url: {
      type: String,
      default: null,
    },
    github_url: {
      type: String,
      default: null,
    },
    profile_image: {
      type: String,
      default: null,
    },
    // Campo opcional para patrón numérico secreto usado por el trigger de login
    pattern: {
      type: String,
      default: null,
    },
    last_login_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
