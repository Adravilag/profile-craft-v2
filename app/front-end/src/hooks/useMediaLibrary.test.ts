import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMediaLibrary } from './useMediaLibrary';

describe('useMediaLibrary', () => {
  let mockTextAreaRef: React.RefObject<HTMLTextAreaElement>;
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockTextArea: HTMLTextAreaElement;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockTextArea = {
      value: 'Initial content',
      selectionStart: 0,
      selectionEnd: 0,
      setSelectionRange: vi.fn(),
      focus: vi.fn(),
    } as unknown as HTMLTextAreaElement;

    mockTextAreaRef = {
      current: mockTextArea,
    };
  });

  describe('Modal State Management', () => {
    it('should initialize with closed modal state', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      expect(result.current.isOpen).toBe(false);
    });

    it('should open media library modal', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      act(() => {
        result.current.openLibrary();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should close media library modal', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      act(() => {
        result.current.openLibrary();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeLibrary();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Media URL Validation and Type Detection', () => {
    it('should validate image URLs correctly', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      expect(result.current.validateMediaUrl('https://example.com/image.jpg')).toEqual({
        isValid: true,
        type: 'image',
        url: 'https://example.com/image.jpg',
      });

      expect(result.current.validateMediaUrl('https://example.com/image.png')).toEqual({
        isValid: true,
        type: 'image',
        url: 'https://example.com/image.png',
      });

      expect(result.current.validateMediaUrl('https://example.com/image.gif')).toEqual({
        isValid: true,
        type: 'image',
        url: 'https://example.com/image.gif',
      });
    });

    it('should validate video URLs correctly', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      expect(result.current.validateMediaUrl('https://example.com/video.mp4')).toEqual({
        isValid: true,
        type: 'video',
        url: 'https://example.com/video.mp4',
      });

      expect(result.current.validateMediaUrl('https://example.com/video.webm')).toEqual({
        isValid: true,
        type: 'video',
        url: 'https://example.com/video.webm',
      });
    });

    it('should validate file URLs correctly', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      expect(result.current.validateMediaUrl('https://example.com/document.pdf')).toEqual({
        isValid: true,
        type: 'file',
        url: 'https://example.com/document.pdf',
      });

      expect(result.current.validateMediaUrl('https://example.com/archive.zip')).toEqual({
        isValid: true,
        type: 'file',
        url: 'https://example.com/archive.zip',
      });
    });

    it('should reject invalid URLs', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      expect(result.current.validateMediaUrl('not-a-url')).toEqual({
        isValid: false,
        error: 'Invalid URL format',
      });

      expect(result.current.validateMediaUrl('')).toEqual({
        isValid: false,
        error: 'URL is required',
      });

      expect(result.current.validateMediaUrl('ftp://example.com/file.txt')).toEqual({
        isValid: false,
        error: 'Only HTTP and HTTPS URLs are supported',
      });
    });
  });

  describe('HTML Generation for Different Media Types', () => {
    it('should generate correct HTML for images', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      const imageHtml = result.current.getMediaHtml(
        'https://example.com/image.jpg',
        'image',
        'Test image'
      );
      expect(imageHtml).toBe('<img src="https://example.com/image.jpg" alt="Test image" />');

      const imageHtmlNoAlt = result.current.getMediaHtml('https://example.com/image.jpg', 'image');
      expect(imageHtmlNoAlt).toBe('<img src="https://example.com/image.jpg" alt="" />');
    });

    it('should generate correct HTML for videos', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      const videoHtml = result.current.getMediaHtml('https://example.com/video.mp4', 'video');
      expect(videoHtml).toBe(
        '<video controls><source src="https://example.com/video.mp4" type="video/mp4">Your browser does not support the video tag.</video>'
      );
    });

    it('should generate correct HTML for files', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      const fileHtml = result.current.getMediaHtml(
        'https://example.com/document.pdf',
        'file',
        'Download PDF'
      );
      expect(fileHtml).toBe('<a href="https://example.com/document.pdf" download>Download PDF</a>');

      const fileHtmlNoText = result.current.getMediaHtml(
        'https://example.com/document.pdf',
        'file'
      );
      expect(fileHtmlNoText).toBe(
        '<a href="https://example.com/document.pdf" download>document.pdf</a>'
      );
    });
  });

  describe('Media Insertion and Cursor Positioning', () => {
    it('should insert media at cursor position', () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5;

      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'Hello world', mockOnChange)
      );

      act(() => {
        result.current.insertMedia('https://example.com/image.jpg', 'image');
      });

      expect(mockOnChange).toHaveBeenCalledWith(
        'Hello<img src="https://example.com/image.jpg" alt="" /> world'
      );
    });

    it('should replace selected text with media', () => {
      mockTextArea.selectionStart = 6;
      mockTextArea.selectionEnd = 11; // "world" is selected

      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'Hello world', mockOnChange)
      );

      act(() => {
        result.current.insertMedia('https://example.com/image.jpg', 'image');
      });

      expect(mockOnChange).toHaveBeenCalledWith(
        'Hello <img src="https://example.com/image.jpg" alt="" />'
      );
    });

    it('should position cursor after inserted media', () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5;

      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'Hello world', mockOnChange)
      );

      act(() => {
        result.current.insertMedia('https://example.com/image.jpg', 'image');
      });

      // Should position cursor after the inserted media HTML
      const expectedPosition = 5 + '<img src="https://example.com/image.jpg" alt="" />'.length;
      expect(mockTextArea.setSelectionRange).toHaveBeenCalledWith(
        expectedPosition,
        expectedPosition
      );
    });

    it('should focus textarea after media insertion', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'Hello world', mockOnChange)
      );

      act(() => {
        result.current.insertMedia('https://example.com/image.jpg', 'image');
      });

      expect(mockTextArea.focus).toHaveBeenCalled();
    });

    it('should close modal after successful media insertion', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'Hello world', mockOnChange)
      );

      act(() => {
        result.current.openLibrary();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.insertMedia('https://example.com/image.jpg', 'image');
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing textarea ref gracefully', () => {
      const emptyRef = { current: null };

      const { result } = renderHook(() => useMediaLibrary(emptyRef, 'test content', mockOnChange));

      expect(() => {
        act(() => {
          result.current.insertMedia('https://example.com/image.jpg', 'image');
        });
      }).not.toThrow();

      // Should still call onChange with updated content
      expect(mockOnChange).toHaveBeenCalledWith(
        'test content<img src="https://example.com/image.jpg" alt="" />'
      );
    });

    it('should handle invalid media type gracefully', () => {
      // Set cursor at end of content
      mockTextArea.selectionStart = 12; // 'test content'.length
      mockTextArea.selectionEnd = 12;

      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      act(() => {
        result.current.insertMedia('https://example.com/unknown.xyz', 'unknown' as any);
      });

      // Should fallback to file type
      expect(mockOnChange).toHaveBeenCalledWith(
        'test content<a href="https://example.com/unknown.xyz" download>unknown.xyz</a>'
      );
    });

    it('should handle empty URL gracefully', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      expect(() => {
        act(() => {
          result.current.insertMedia('', 'image');
        });
      }).not.toThrow();

      // Should not call onChange for empty URL
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should validate URL before insertion', () => {
      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'test content', mockOnChange)
      );

      act(() => {
        result.current.insertMedia('not-a-url', 'image');
      });

      // Should not call onChange for invalid URL
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Media Insertion Workflow', () => {
    it('should complete full workflow: open modal -> insert media -> close modal', () => {
      // Set cursor at end of content
      mockTextArea.selectionStart = 15; // 'Initial content'.length
      mockTextArea.selectionEnd = 15;

      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'Initial content', mockOnChange)
      );

      // Step 1: Open modal
      act(() => {
        result.current.openLibrary();
      });
      expect(result.current.isOpen).toBe(true);

      // Step 2: Insert media
      act(() => {
        result.current.insertMedia('https://example.com/image.jpg', 'image');
      });

      // Step 3: Verify modal closed and content updated
      expect(result.current.isOpen).toBe(false);
      expect(mockOnChange).toHaveBeenCalledWith(
        'Initial content<img src="https://example.com/image.jpg" alt="" />'
      );
      expect(mockTextArea.focus).toHaveBeenCalled();
    });

    it('should handle multiple media insertions', () => {
      // Set cursor at end of content
      mockTextArea.selectionStart = 9; // 'Content: '.length
      mockTextArea.selectionEnd = 9;

      const { result } = renderHook(() =>
        useMediaLibrary(mockTextAreaRef, 'Content: ', mockOnChange)
      );

      // First insertion
      act(() => {
        result.current.insertMedia('https://example.com/image1.jpg', 'image');
      });

      expect(mockOnChange).toHaveBeenCalledWith(
        'Content: <img src="https://example.com/image1.jpg" alt="" />'
      );

      // Update content for second insertion
      mockOnChange.mockClear();

      // Second insertion
      act(() => {
        result.current.insertMedia('https://example.com/video.mp4', 'video');
      });

      expect(mockOnChange).toHaveBeenCalledWith(
        'Content: <video controls><source src="https://example.com/video.mp4" type="video/mp4">Your browser does not support the video tag.</video>'
      );
    });
  });
});
