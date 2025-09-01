import { describe, it, expect } from 'vitest';
import { isCloudinaryUrl, isBlobUrl, extractPublicIdFromUrl } from '../cloudinaryHelpers';

describe('cloudinaryHelpers', () => {
  it('detects cloudinary urls', () => {
    expect(
      isCloudinaryUrl('https://res.cloudinary.com/demo/image/upload/v12345/folder/image.jpg')
    ).toBe(true);
    expect(isCloudinaryUrl('https://example.com/image.jpg')).toBe(false);
    expect(isCloudinaryUrl(null)).toBe(false);
  });

  it('detects blob urls', () => {
    expect(isBlobUrl('blob:https://example.com/123')).toBe(true);
    expect(isBlobUrl('https://res.cloudinary.com/demo/image.jpg')).toBe(false);
  });

  it('extracts public id correctly', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v12345/folder/sub/image_name.jpg';
    expect(extractPublicIdFromUrl(url)).toBe('folder/sub/image_name');

    const urlNoVersion = 'https://res.cloudinary.com/demo/image/upload/folder/image.png';
    expect(extractPublicIdFromUrl(urlNoVersion)).toBe('folder/image');

    const urlWithQuery = 'https://res.cloudinary.com/demo/image/upload/v1/folder/image.jpg?q=1';
    expect(extractPublicIdFromUrl(urlWithQuery)).toBe('folder/image');

    expect(extractPublicIdFromUrl(null)).toBeNull();
    expect(extractPublicIdFromUrl('https://example.com/no-upload/path.jpg')).toBeNull();
  });
});
