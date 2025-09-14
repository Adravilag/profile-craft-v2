import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Import model (uses compiled JS build in this repo layout)
import Skill from '../models/Skill.js';

function normalizeSlug(name: string) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

describe('DB vs skill_setings.json', () => {
  let mongoUri: string | undefined;

  beforeAll(async () => {
    mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      // Skip connecting; tests will fail intentionally if we try to connect without URI
      return;
    }

    await mongoose.connect(mongoUri, {
      // use default options
    } as any);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  it('should match skills in DB with entries in skill_setings.json by slug', async () => {
    if (!mongoUri) {
      // If no DB configured, mark test as skipped but not failing
      console.warn('MONGODB_URI not provided - skipping DB comparison test');
      return;
    }

    // Read JSON
    const raw = fs.readFileSync(
      path.join(__dirname, '..', '..', 'front-end', 'src', 'config', 'skill_setings.json'),
      'utf-8'
    );
    const seed: Array<any> = JSON.parse(raw);

    // Build a map of slugs expected
    const expectedSlugs = new Map<string, any>();
    for (const entry of seed) {
      const slug = entry.slug || normalizeSlug(entry.name || '');
      expectedSlugs.set(slug, entry);
    }

    // Fetch skills from DB for admin user if available (user_id is ObjectId) or all
    const dbSkills = (await Skill.find({}).lean()) as any[];

    const dbSlugs = new Map<string, any>();
    for (const s of dbSkills) {
      const slug = normalizeSlug(s.name || s.slug || '');
      dbSlugs.set(slug, s);
    }

    // Detect missing in DB and extra in DB
    const missingInDb: string[] = [];
    for (const [slug] of expectedSlugs) {
      if (!dbSlugs.has(slug)) missingInDb.push(slug);
    }

    const extraInDb: string[] = [];
    for (const [slug] of dbSlugs) {
      if (!expectedSlugs.has(slug)) extraInDb.push(slug);
    }

    // Provide helpful diagnostics in the assertion messages
    expect(missingInDb, `Missing skills in DB: ${missingInDb.join(', ') || 'none'}`).toEqual([]);
    expect(
      extraInDb,
      `Extra skills in DB (not present in JSON): ${extraInDb.join(', ') || 'none'}`
    ).toEqual([]);
  });
});
