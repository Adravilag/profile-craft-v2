import { useState, useCallback } from 'react';

export interface MediaValidationResult {
  isValid: boolean;
  type?: 'image' | 'video' | 'file';
  url?: string;
  error?: string;
}

export interface UseMediaLibraryReturn {
  isOpen: boolean;
  openLibrary: () => void;
  closeLibrary: () => void;
  insertMedia: (url: string, type: 'image' | 'video' | 'file') => void;
  getMediaHtml: (url: string, type: string, altText?: string) => string;
  validateMediaUrl: (url: string) => MediaValidationResult;
}

export function useMediaLibrary(
  textAreaRef: React.RefObject<HTMLTextAreaElement>,
  content: string,
  onChange: (content: string) => void
): UseMediaLibraryReturn {
  const [isOpen, setIsOpen] = useState(false);

  const openLibrary = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeLibrary = useCallback(() => {
    setIsOpen(false);
  }, []);

  const validateMediaUrl = useCallback((url: string): MediaValidationResult => {
    if (!url || url.trim() === '') {
      return {
        isValid: false,
        error: 'URL is required',
      };
    }

    try {
      const urlObj = new URL(url);

      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          error: 'Only HTTP and HTTPS URLs are supported',
        };
      }

      // Detect media type based on file extension
      const pathname = urlObj.pathname.toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];

      let type: 'image' | 'video' | 'file' = 'file';

      if (imageExtensions.some(ext => pathname.endsWith(ext))) {
        type = 'image';
      } else if (videoExtensions.some(ext => pathname.endsWith(ext))) {
        type = 'video';
      }

      return {
        isValid: true,
        type,
        url,
      };
    } catch {
      return {
        isValid: false,
        error: 'Invalid URL format',
      };
    }
  }, []);

  const getMediaHtml = useCallback((url: string, type: string, altText?: string): string => {
    switch (type) {
      case 'image':
        return `<img src="${url}" alt="${altText || ''}" />`;

      case 'video':
        const videoType = url.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
        return `<video controls><source src="${url}" type="${videoType}">Your browser does not support the video tag.</video>`;

      case 'file':
      default:
        const fileName = altText || url.split('/').pop() || 'file';
        return `<a href="${url}" download>${fileName}</a>`;
    }
  }, []);

  const insertMedia = useCallback(
    (url: string, type: 'image' | 'video' | 'file') => {
      if (!url || url.trim() === '') {
        return;
      }

      // Validate URL before insertion
      const validation = validateMediaUrl(url);
      if (!validation.isValid) {
        return;
      }

      const mediaHtml = getMediaHtml(url, type);
      const textarea = textAreaRef.current;

      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Insert media HTML at cursor position or replace selection
        const newContent = content.slice(0, start) + mediaHtml + content.slice(end);
        onChange(newContent);

        // Position cursor after inserted media
        const newCursorPosition = start + mediaHtml.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      } else {
        // If no textarea ref, just append to content
        onChange(content + mediaHtml);
      }

      // Close modal after successful insertion
      closeLibrary();
    },
    [content, onChange, textAreaRef, validateMediaUrl, getMediaHtml, closeLibrary]
  );

  return {
    isOpen,
    openLibrary,
    closeLibrary,
    insertMedia,
    getMediaHtml,
    validateMediaUrl,
  };
}
