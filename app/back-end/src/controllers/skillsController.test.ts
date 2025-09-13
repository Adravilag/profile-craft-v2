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
    };
    const res = mockRes();

    await skillsController.updateSkill(req, res);

    expect(mockFind).toHaveBeenCalled();
    const updateArg = mockFind.mock.calls[0][1];
    expect(updateArg.comment).toEqual({ en: 'New string', es: '' });
  });
});
