import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OptimizedImage } from '../index';

describe('OptimizedImage', () => {
  it('renders with src and fallback on error', async () => {
    render(<OptimizedImage src="/not-found.jpg" fallback="/fallback.jpg" alt="img" />);
    const img = screen.getByAltText('img') as HTMLImageElement;

    // Forzar onError usando fireEvent.error y esperar el re-render
    fireEvent.error(img);

    await waitFor(() => {
      expect(img.src).toContain('/fallback.jpg');
    });
  });
});
