import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import Education from '../src/models/Education.js';

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/profilecraft_test';

beforeAll(async () => {
  await mongoose.connect(MONGO);
  await Education.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Education localization merge', () => {
  it('should preserve other locale when updating only one language', async () => {
    const created = await Education.create({
      user_id: new mongoose.Types.ObjectId(),
      title: { es: 'Titulo ES', en: 'Title EN' },
      institution: { es: 'Inst ES', en: 'Inst EN' },
      description: { es: 'Desc ES', en: 'Desc EN' },
      start_date: new Date().toISOString(),
      order_index: 0,
    } as any);

    // Simulate API update that only provides 'es' for title
    await Education.findByIdAndUpdate(created._id, {
      title: { es: 'Titulo ES mod' },
    } as any);

    const found = await Education.findById(created._id).lean();
    expect(found.title.es).toBe('Titulo ES mod');
    expect(found.title.en).toBe('Title EN');
  });
});
