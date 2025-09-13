import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  _id: string;
  user_id: string;
  name: string;
  category: string;
  level: number;
  order_index: number;
  comment?: {
    en: string;
    es: string;
  };
  created_at: Date;
  updated_at: Date;
}

const SkillSchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    level: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    // Optional HTML comment associated with this skill. Stored as object with language keys.
    comment: {
      type: {
        en: { type: String, default: '' },
        es: { type: String, default: '' },
      },
      default: { en: '', es: '' },
    },
    order_index: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for better performance
SkillSchema.index({ user_id: 1, order_index: 1 });
SkillSchema.index({ user_id: 1, category: 1 });

const Skill = mongoose.model<ISkill>('Skill', SkillSchema);
export default Skill;
