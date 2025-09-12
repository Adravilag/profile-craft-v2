import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEditorToolbar } from './useEditorToolbar';

describe('useEditorToolbar', () => {
  let mockTextAreaRef: React.RefObject<HTMLTextAreaElement>;
  let mockTextArea: HTMLTextAreaElement;
  let mockOnChange: ReturnType<typeof vi.fn>;
  let initialContent: string;

  beforeEach(() => {
    // Create a mock textarea element
    mockTextArea = document.createElement('textarea');
    mockTextArea.value = 'Hello world';
    mockTextArea.selectionStart = 0;
    mockTextArea.selectionEnd = 5; // "Hello" selected

    mockTextAreaRef = { current: mockTextArea };
    mockOnChange = vi.fn();
    initialContent = 'Hello world';

    // Mock textarea methods
    vi.spyOn(mockTextArea, 'focus');
    vi.spyOn(mockTextArea, 'setSelectionRange');
  });

  describe('wrapWithTag', () => {
    it('should wrap selected text with HTML tag', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.wrapWithTag('strong');
      });

      expect(mockOnChange).toHaveBeenCalledWith('<strong>Hello</strong> world');
    });

    it('should wrap selected text with HTML tag and attributes', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.wrapWithTag('a', 'href="https://example.com"');
      });

      expect(mockOnChange).toHaveBeenCalledWith('<a href="https://example.com">Hello</a> world');
    });

    it('should handle no selection by inserting empty tag at cursor', () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5; // No selection, cursor at position 5

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.wrapWithTag('span');
      });

      expect(mockOnChange).toHaveBeenCalledWith('Hello<span></span> world');
    });

    it('should position cursor correctly after wrapping', async () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      await act(async () => {
        result.current.wrapWithTag('strong');
        // Wait for setTimeout to complete
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Should position cursor after the opening tag
      expect(mockTextArea.setSelectionRange).toHaveBeenCalledWith(8, 13); // Inside <strong>Hello</strong>
    });
  });

  describe('insertContent', () => {
    it('should insert content at cursor position', () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5; // Cursor at position 5

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertContent(' inserted');
      });

      expect(mockOnChange).toHaveBeenCalledWith('Hello inserted world');
    });

    it('should replace selected text with new content', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertContent('Hi');
      });

      expect(mockOnChange).toHaveBeenCalledWith('Hi world');
    });

    it('should position cursor after inserted content', async () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      await act(async () => {
        result.current.insertContent(' test');
        // Wait for setTimeout to complete
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(mockTextArea.setSelectionRange).toHaveBeenCalledWith(10, 10); // After " test"
    });
  });

  describe('formatSelection', () => {
    it('should format selected text as bold in HTML mode', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.formatSelection('bold');
      });

      expect(mockOnChange).toHaveBeenCalledWith('<strong>Hello</strong> world');
    });

    it('should format selected text as italic in HTML mode', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.formatSelection('italic');
      });

      expect(mockOnChange).toHaveBeenCalledWith('<em>Hello</em> world');
    });

    it('should format selected text as code in HTML mode', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.formatSelection('code');
      });

      expect(mockOnChange).toHaveBeenCalledWith('<code>Hello</code> world');
    });

    it('should format selected text as link in HTML mode', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.formatSelection('link');
      });

      expect(mockOnChange).toHaveBeenCalledWith('<a href="">Hello</a> world');
    });
  });

  describe('insertHeader', () => {
    it('should insert H1 header at cursor position', () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertHeader(1);
      });

      expect(mockOnChange).toHaveBeenCalledWith('Hello<h1></h1> world');
    });

    it('should wrap selected text in header tag', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertHeader(2);
      });

      expect(mockOnChange).toHaveBeenCalledWith('<h2>Hello</h2> world');
    });

    it('should handle all header levels (1-6)', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      for (let level = 1; level <= 6; level++) {
        act(() => {
          result.current.insertHeader(level as 1 | 2 | 3 | 4 | 5 | 6);
        });

        expect(mockOnChange).toHaveBeenCalledWith(`<h${level}>Hello</h${level}> world`);
      }
    });
  });

  describe('insertList', () => {
    it('should insert unordered list at cursor position', () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertList('ul');
      });

      expect(mockOnChange).toHaveBeenCalledWith('Hello<ul>\n  <li></li>\n</ul> world');
    });

    it('should insert ordered list at cursor position', () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertList('ol');
      });

      expect(mockOnChange).toHaveBeenCalledWith('Hello<ol>\n  <li></li>\n</ol> world');
    });

    it('should wrap selected text in list item', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertList('ul');
      });

      expect(mockOnChange).toHaveBeenCalledWith('<ul>\n  <li>Hello</li>\n</ul> world');
    });
  });

  describe('getHtmlSuggestions', () => {
    it('should return HTML tag suggestions for partial input', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      const suggestions = result.current.getHtmlSuggestions('<d', 2);

      expect(suggestions).toContain('div');
      expect(suggestions).toContain('details');
      expect(suggestions).not.toContain('span');
    });

    it('should return empty array for non-tag context', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      const suggestions = result.current.getHtmlSuggestions('hello world', 5);

      expect(suggestions).toEqual([]);
    });

    it('should return all common tags when typing "<"', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      const suggestions = result.current.getHtmlSuggestions('<', 1);

      expect(suggestions).toContain('div');
      expect(suggestions).toContain('span');
      expect(suggestions).toContain('p');
      expect(suggestions).toContain('h1');
      expect(suggestions.length).toBeGreaterThan(10);
    });

    it('should filter suggestions based on partial tag name', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      const suggestions = result.current.getHtmlSuggestions('<h', 2);

      expect(suggestions).toContain('h1');
      expect(suggestions).toContain('h2');
      expect(suggestions).toContain('h3');
      expect(suggestions).toContain('header');
      expect(suggestions).not.toContain('div');
      expect(suggestions).not.toContain('span');
    });
  });

  describe('markdown formatting support', () => {
    it('should support markdown bold formatting when in markdown mode', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertContent('**bold text**');
      });

      expect(mockOnChange).toHaveBeenCalledWith('**bold text** world');
    });

    it('should support markdown italic formatting', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertContent('*italic text*');
      });

      expect(mockOnChange).toHaveBeenCalledWith('*italic text* world');
    });

    it('should support markdown headers', () => {
      mockTextArea.selectionStart = 0;
      mockTextArea.selectionEnd = 0;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertContent('# Header 1\n');
      });

      expect(mockOnChange).toHaveBeenCalledWith('# Header 1\nHello world');
    });

    it('should support markdown lists', () => {
      mockTextArea.selectionStart = 0;
      mockTextArea.selectionEnd = 0;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertContent('- List item\n');
      });

      expect(mockOnChange).toHaveBeenCalledWith('- List item\nHello world');
    });
  });

  describe('formatMarkdown', () => {
    it('should format selected text as bold in markdown', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.formatMarkdown('bold');
      });

      expect(mockOnChange).toHaveBeenCalledWith('**Hello** world');
    });

    it('should format selected text as italic in markdown', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.formatMarkdown('italic');
      });

      expect(mockOnChange).toHaveBeenCalledWith('*Hello* world');
    });

    it('should format selected text as code in markdown', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.formatMarkdown('code');
      });

      expect(mockOnChange).toHaveBeenCalledWith('`Hello` world');
    });

    it('should format selected text as strikethrough in markdown', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.formatMarkdown('strikethrough');
      });

      expect(mockOnChange).toHaveBeenCalledWith('~~Hello~~ world');
    });
  });

  describe('insertMarkdownHeader', () => {
    it('should insert markdown header at cursor position', () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertMarkdownHeader(1);
      });

      expect(mockOnChange).toHaveBeenCalledWith('Hello#  world');
    });

    it('should wrap selected text in markdown header', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertMarkdownHeader(2);
      });

      expect(mockOnChange).toHaveBeenCalledWith('## Hello world');
    });

    it('should handle all header levels (1-6)', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      for (let level = 1; level <= 6; level++) {
        act(() => {
          result.current.insertMarkdownHeader(level as 1 | 2 | 3 | 4 | 5 | 6);
        });

        const expectedPrefix = '#'.repeat(level) + ' ';
        expect(mockOnChange).toHaveBeenCalledWith(`${expectedPrefix}Hello world`);
      }
    });
  });

  describe('insertMarkdownList', () => {
    it('should insert markdown unordered list at cursor position', () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertMarkdownList('ul');
      });

      expect(mockOnChange).toHaveBeenCalledWith('Hello-  world');
    });

    it('should insert markdown ordered list at cursor position', () => {
      mockTextArea.selectionStart = 5;
      mockTextArea.selectionEnd = 5;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertMarkdownList('ol');
      });

      expect(mockOnChange).toHaveBeenCalledWith('Hello1.  world');
    });

    it('should wrap selected text in markdown list item', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.insertMarkdownList('ul');
      });

      expect(mockOnChange).toHaveBeenCalledWith('- Hello world');
    });
  });

  describe('toolbar state management', () => {
    it('should maintain consistent behavior across multiple operations', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      // First operation - format selection
      act(() => {
        result.current.formatSelection('bold');
      });

      expect(mockOnChange).toHaveBeenCalledWith('<strong>Hello</strong> world');

      // Reset mock for second operation
      mockOnChange.mockClear();

      // Second operation - insert content at a different position
      mockTextArea.selectionStart = 11; // End of content
      mockTextArea.selectionEnd = 11;

      act(() => {
        result.current.insertContent('!');
      });

      expect(mockOnChange).toHaveBeenCalledWith('Hello world!');
    });

    it('should handle rapid successive operations', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        result.current.formatSelection('bold');
        result.current.insertContent(' extra');
        result.current.formatSelection('italic');
      });

      // Should have been called multiple times
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('active tool tracking', () => {
    it('should provide consistent interface for all formatting tools', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      // Test that all formatting methods exist and are callable
      expect(typeof result.current.wrapWithTag).toBe('function');
      expect(typeof result.current.insertContent).toBe('function');
      expect(typeof result.current.formatSelection).toBe('function');
      expect(typeof result.current.insertHeader).toBe('function');
      expect(typeof result.current.insertList).toBe('function');
      expect(typeof result.current.getHtmlSuggestions).toBe('function');
    });

    it('should handle tool state transitions smoothly', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      // Simulate switching between different tools
      act(() => {
        result.current.formatSelection('bold');
      });

      act(() => {
        result.current.formatSelection('italic');
      });

      act(() => {
        result.current.insertHeader(1);
      });

      // Should not throw and should maintain functionality
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('advanced HTML tag suggestions', () => {
    it('should provide context-aware suggestions', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      // Test suggestions for form elements
      const formSuggestions = result.current.getHtmlSuggestions('<f', 2);
      expect(formSuggestions).toContain('form');
      expect(formSuggestions).toContain('fieldset');
      expect(formSuggestions).toContain('figure');

      // Test suggestions for semantic elements
      const semanticSuggestions = result.current.getHtmlSuggestions('<s', 2);
      expect(semanticSuggestions).toContain('section');
      expect(semanticSuggestions).toContain('span');
      expect(semanticSuggestions).toContain('strong');
      expect(semanticSuggestions).toContain('summary');
    });

    it('should handle edge cases in suggestion matching', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      // Test empty partial
      const emptySuggestions = result.current.getHtmlSuggestions('<', 1);
      expect(emptySuggestions.length).toBeGreaterThan(20);

      // Test non-matching partial
      const noMatchSuggestions = result.current.getHtmlSuggestions('<xyz', 4);
      expect(noMatchSuggestions).toEqual([]);

      // Test case insensitivity
      const upperCaseSuggestions = result.current.getHtmlSuggestions('<DIV', 4);
      expect(upperCaseSuggestions).toContain('div');
    });
  });

  describe('error handling', () => {
    it('should handle null textarea ref gracefully', () => {
      const nullRef = { current: null };

      const { result } = renderHook(() => useEditorToolbar(nullRef, initialContent, mockOnChange));

      expect(() => {
        act(() => {
          result.current.wrapWithTag('strong');
        });
      }).not.toThrow();
    });

    it('should handle empty content gracefully', () => {
      mockTextArea.value = '';
      mockTextArea.selectionStart = 0;
      mockTextArea.selectionEnd = 0;

      const { result } = renderHook(() => useEditorToolbar(mockTextAreaRef, '', mockOnChange));

      act(() => {
        result.current.insertContent('test');
      });

      expect(mockOnChange).toHaveBeenCalledWith('test');
    });

    it('should handle invalid selection ranges', () => {
      mockTextArea.selectionStart = 100; // Beyond content length
      mockTextArea.selectionEnd = 200;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      expect(() => {
        act(() => {
          result.current.formatSelection('bold');
        });
      }).not.toThrow();
    });

    it('should handle negative selection ranges', () => {
      mockTextArea.selectionStart = -1;
      mockTextArea.selectionEnd = -1;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      expect(() => {
        act(() => {
          result.current.insertContent('test');
        });
      }).not.toThrow();
    });
  });

  describe('performance and optimization', () => {
    it('should handle large content efficiently', () => {
      const largeContent = 'A'.repeat(10000) + ' world';
      mockTextArea.value = largeContent;
      mockTextArea.selectionStart = 0;
      mockTextArea.selectionEnd = 5;

      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, largeContent, mockOnChange)
      );

      const startTime = performance.now();

      act(() => {
        result.current.formatSelection('bold');
      });

      const endTime = performance.now();

      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle rapid successive calls without issues', () => {
      const { result } = renderHook(() =>
        useEditorToolbar(mockTextAreaRef, initialContent, mockOnChange)
      );

      act(() => {
        // Simulate rapid user interactions
        for (let i = 0; i < 10; i++) {
          result.current.insertContent(`${i}`);
        }
      });

      expect(mockOnChange).toHaveBeenCalledTimes(10);
    });
  });
});
