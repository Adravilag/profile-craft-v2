import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Experience from '../src/models/Experience.js';
import Education from '../src/models/Education.js';

dotenv.config();

const MONGO =
  process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/profilecraft';

async function normalizeLocalized(value: any) {
  if (value == null) return { es: '', en: '' };
  if (typeof value === 'string') return { es: value, en: value };
  if (typeof value === 'object' && ('es' in value || 'en' in value)) {
    return { es: value.es ?? value.en ?? '', en: value.en ?? value.es ?? '' };
  }
  return { es: String(value), en: String(value) };
}

async function migrate() {
  await mongoose.connect(MONGO, { dbName: process.env.MONGO_DB || undefined } as any);
  console.log('Connected to', MONGO);

  // Migrate Experiences
  const experiences = await Experience.find().lean();
  for (const exp of experiences) {
    const updates: any = {};
    if (exp.company && typeof exp.company === 'string')
      updates.company = await normalizeLocalized(exp.company);
    if (exp.position && typeof exp.position === 'string')
      updates.position = await normalizeLocalized(exp.position);
    if (exp.description && typeof exp.description === 'string')
      updates.description = await normalizeLocalized(exp.description);
    if (Object.keys(updates).length > 0) {
      console.log('Updating experience', exp._id, updates);
      await Experience.updateOne({ _id: exp._id }, { $set: updates });
    }
  }

  // Migrate Education
  const educations = await Education.find().lean();
  for (const edu of educations) {
    const updates: any = {};
    if (edu.title && typeof edu.title === 'string')
      updates.title = await normalizeLocalized(edu.title);
    if (edu.institution && typeof edu.institution === 'string')
      updates.institution = await normalizeLocalized(edu.institution);
    if (edu.description && typeof edu.description === 'string')
      updates.description = await normalizeLocalized(edu.description);
    if (Object.keys(updates).length > 0) {
      console.log('Updating education', edu._id, updates);
      await Education.updateOne({ _id: edu._id }, { $set: updates });
    }
  }

  console.log('Migration finished');
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration error', err);
  process.exit(1);
});
