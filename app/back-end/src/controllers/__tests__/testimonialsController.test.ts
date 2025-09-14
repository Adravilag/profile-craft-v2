import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testimonialsController } from '../testimonialsController';

// Mocks
vi.mock('../../models/index.js', () => {
  return {
    Testimonial: {
      find: vi.fn(() => ({ sort: () => ({ lean: () => [] }) })),
    },
  };
});

vi.mock('../../services/userService.js', () => ({
  resolveUserId: vi.fn(async (v: string) => {
    if (v === 'admin') return 'aaaaaaaaaaaaaaaaaaaaaaaa';
    return v;
  }),
}));

describe('testimonialsController.getAdminTestimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve admin sentinel and return 200 with array', async () => {
    const req: any = { query: { userId: 'admin', status: 'all' } };
    const json = vi.fn();
    const res: any = { json, status: vi.fn(() => ({ json })), statusCode: 200 };

    await testimonialsController.getAdminTestimonials(req, res as any);

    expect(json).toHaveBeenCalled();
  });

  it('should return 400 for invalid userId', async () => {
    const req: any = { query: { userId: 'not-an-objectid', status: 'pending' } };
    const status = vi.fn(() => ({ json: vi.fn() }));
    const res: any = { status };

    await testimonialsController.getAdminTestimonials(req, res as any);

    expect(status).toHaveBeenCalledWith(400);
  });
});
