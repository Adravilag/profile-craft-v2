import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import Experience from '../src/models/Experience.js';

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/profilecraft_test';

beforeAll(async () => {
  await mongoose.connect(MONGO);
  await Experience.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Experiences localization merge', () => {
  it('should preserve other locale when updating only one language', async () => {
    const created = await Experience.create({
      user_id: new mongoose.Types.ObjectId(),
      company: { es: 'Empresa ES', en: 'Company EN' },
      position: { es: 'Pos ES', en: 'Pos EN' },
      description: { es: 'Desc ES', en: 'Desc EN' },
      start_date: new Date(),
      order_index: 0,
    } as any);

    // Simulate API update that only provides 'es' for company
    await Experience.findByIdAndUpdate(created._id, {
      company: { es: 'Empresa ES mod' },
    } as any);

    const found = await Experience.findById(created._id).lean();
    expect(found.company.es).toBe('Empresa ES mod');
    expect(found.company.en).toBe('Company EN');
  });
});
