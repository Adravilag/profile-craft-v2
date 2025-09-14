import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks
vi.mock('../models/index.js', () => {
  const mSave = vi.fn();
  const mFindByIdAndUpdate = vi.fn();
  return {
    Skill: vi.fn().mockImplementation(function (data) {
      this.save = mSave;
      Object.assign(this, data);
      this.toObject = () => ({ ...data });
      this._id = 'mocked-id';
    }),
    __mocks: { mSave, mFindByIdAndUpdate },
  };
});

import { skillsController } from './skillsController.js';
import { Skill } from '../models/index.js';

// Helpers para mockear req/res
const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('skillsController - comment normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createSkill should store string comment into comment.en', async () => {
    const req: any = { body: { name: 'X', category: 'Y', comment: 'Hola en ES' } };
    const res = mockRes();

    await skillsController.createSkill(req, res);

    // Skill constructor was called
    expect((Skill as any).mock.calls.length).toBe(1);
    const calledWith = (Skill as any).mock.calls[0][0];
    expect(calledWith.comment).toEqual({ en: 'Hola en ES', es: '' });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('createSkill should store object comment as-is with fallbacks', async () => {
    const req: any = { body: { name: 'X', category: 'Y', comment: { en: 'Hi', es: 'Hola' } } };
    const res = mockRes();

    await skillsController.createSkill(req, res);

    const calledWith = (Skill as any).mock.calls[0][0];
    expect(calledWith.comment).toEqual({ en: 'Hi', es: 'Hola' });
  });

  it('updateSkill should normalize string comment into comment.en', async () => {
    // Mock Skill.findByIdAndUpdate
    const mockFind = vi
      .fn()
      .mockResolvedValue({ _id: 'id', name: 'N', category: 'C', comment: { en: 'abc', es: '' } });
    (Skill as any).findByIdAndUpdate = mockFind;

    const req: any = {
      params: { id: 'id' },
      body: { name: 'N', category: 'C', comment: 'New string' },
      headers: { 'content-type': 'application/json' },
    };
    const res = mockRes();

    await skillsController.updateSkill(req, res);

    expect(mockFind).toHaveBeenCalled();
    const updateArg = mockFind.mock.calls[0][1];
    expect(updateArg.comment).toEqual({ en: 'New string', es: '' });
  });

  it('updateSkill should allow comment-only updates without name and category', async () => {
    const mockFind = vi
      .fn()
      .mockResolvedValue({
        _id: 'id',
        name: 'Existing Name',
        category: 'Existing Category',
        comment: { en: 'Updated comment', es: '' },
      });
    (Skill as any).findByIdAndUpdate = mockFind;

    const req: any = {
      params: { id: 'id' },
      body: { comment: 'Updated comment' },
      headers: { 'content-type': 'application/json' },
    };
    const res = mockRes();

    await skillsController.updateSkill(req, res);

    expect(mockFind).toHaveBeenCalled();
    const updateArg = mockFind.mock.calls[0][1];
    expect(updateArg.comment).toEqual({ en: 'Updated comment', es: '' });
    expect(updateArg.name).toBeUndefined(); // Should not include name in update
    expect(updateArg.category).toBeUndefined(); // Should not include category in update
    expect(res.json).toHaveBeenCalled();
  });

  it('updateSkill should reject updates with no valid fields', async () => {
    const req: any = {
      params: { id: 'id' },
      body: {},
      headers: { 'content-type': 'application/json' },
    };
    const res = mockRes();

    await skillsController.updateSkill(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Al menos un campo debe ser proporcionado para actualizar',
        code: 'VALIDATION_ERROR',
      })
    );
  });

  it('updateSkill should require name and category for non-comment-only updates', async () => {
    const req: any = {
      params: { id: 'id' },
      body: { level: 75 }, // Trying to update level without name/category
      headers: { 'content-type': 'application/json' },
    };
    const res = mockRes();

    await skillsController.updateSkill(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Nombre y categoría son requeridos para actualizaciones completas',
        code: 'VALIDATION_ERROR',
      })
    );
  });

  it('updateSkill should handle skill not found', async () => {
    const mockFind = vi.fn().mockResolvedValue(null);
    (Skill as any).findByIdAndUpdate = mockFind;

    const req: any = {
      params: { id: 'nonexistent-id' },
      body: { comment: 'Test comment' },
      headers: { 'content-type': 'application/json' },
    };
    const res = mockRes();

    await skillsController.updateSkill(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Habilidad no encontrada',
        code: 'NOT_FOUND',
      })
    );
  });
});
