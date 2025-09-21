import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageCarousel from './ImageCarousel';
import { describe, it, expect, beforeAll } from 'vitest';

// Minimal mock that satisfies TypeScript for IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [0];
  callback: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
  }
  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, target, intersectionRatio: 1 } as IntersectionObserverEntry],
      this
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

beforeAll(() => {
  // @ts-ignore assign mock
  global.IntersectionObserver = MockIntersectionObserver as any;
});

describe('ImageCarousel', () => {
  it('renders main image and thumbnails', async () => {
    const images = ['/img1.jpg', '/img2.jpg'];
    render(<ImageCarousel images={images} title="Test" />);

    // main image should be in the document
    const imgs = await screen.findAllByRole('img');
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    // the first of the strip should have src set to /img1.jpg
    const mainImg = imgs.find(img => img.getAttribute('src')?.includes('img1'));
    expect(mainImg).toBeInTheDocument();
  });
});
