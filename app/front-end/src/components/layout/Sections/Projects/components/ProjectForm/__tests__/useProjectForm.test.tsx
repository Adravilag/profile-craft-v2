import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useProjectForm } from '../hooks/useProjectForm';

describe('useProjectForm', () => {
  it('auto-fills image_url from gallery_images and calls createProject on save', async () => {
    // Mock createProject implementation
    const mockCreate = vi.fn().mockResolvedValue({ id: 'new-id' });
    vi.mock('@/services/endpoints/projects', () => ({ createProject: mockCreate }));

    const { result } = renderHook(() => useProjectForm());

    // Initially image_url empty
    expect(result.current.form.image_url).toBe('');

    // Set gallery images
    act(() => {
      result.current.setForm(prev => ({ ...prev, gallery_images: ['https://img.test/1.jpg'] }));
    });

    // After update, image_url should be auto-filled
    expect(result.current.form.image_url).toBe('https://img.test/1.jpg');

    // Mock validation to pass and call handleSave (we'll spy on createProject via mock)
    await act(async () => {
      await result.current.handleSave();
    });

    // createProject should have been called
    expect(mockCreate).toHaveBeenCalled();
  });
});
