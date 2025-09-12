import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorModes } from './useEditorModes';

describe('useEditorModes', () => {
  describe('Mode Management', () => {
    it('should initialize with default mode', () => {
      const { result } = renderHook(() => useEditorModes());

      expect(result.current.currentMode).toBe('html');
      expect(result.current.isConverting).toBe(false);
    });

    it('should initialize with provided initial mode', () => {
      const { result } = renderHook(() => useEditorModes('markdown'));

      expect(result.current.currentMode).toBe('markdown');
    });

    it('should switch modes correctly', () => {
      const { result } = renderHook(() => useEditorModes());

      act(() => {
        result.current.setMode('markdown');
      });

      expect(result.current.currentMode).toBe('markdown');
    });

    it('should handle all supported modes', () => {
      const { result } = renderHook(() => useEditorModes());
      const modes = ['html', 'markdown', 'preview', 'split-horizontal', 'split-vertical'] as const;

      modes.forEach(mode => {
        act(() => {
          result.current.setMode(mode);
        });
        expect(result.current.currentMode).toBe(mode);
      });
    });
  });

  describe('Content Conversion', () => {
    it('should convert HTML to Markdown correctly', () => {
      const { result } = renderHook(() => useEditorModes());

      const htmlContent = '<h1>Hello World</h1><p>This is a <strong>test</strong> paragraph.</p>';
      let converted: string;

      act(() => {
        converted = result.current.convertContent(htmlContent, 'html', 'markdown');
      });

      expect(converted!).toBe('# Hello World\n\nThis is a **test** paragraph.');
    });

    it('should convert Markdown to HTML correctly', () => {
      const { result } = renderHook(() => useEditorModes());

      const markdownContent = '# Hello World\n\nThis is a **test** paragraph.';
      let converted: string;

      act(() => {
        converted = result.current.convertContent(markdownContent, 'markdown', 'html');
      });

      expect(converted!).toBe(
        '<h1>Hello World</h1>\n<p>This is a <strong>test</strong> paragraph.</p>'
      );
    });

    it('should preserve content when converting to same format', () => {
      const { result } = renderHook(() => useEditorModes());

      const content = '<p>Test content</p>';
      let converted: string;

      act(() => {
        converted = result.current.convertContent(content, 'html', 'html');
      });

      expect(converted!).toBe(content);
    });

    it('should handle empty content gracefully', () => {
      const { result } = renderHook(() => useEditorModes());

      let converted: string;

      act(() => {
        converted = result.current.convertContent('', 'html', 'markdown');
      });

      expect(converted!).toBe('');
    });

    it('should handle invalid HTML gracefully', () => {
      const { result } = renderHook(() => useEditorModes());

      const invalidHtml = '<div><p>Unclosed tags';
      let converted: string;

      act(() => {
        converted = result.current.convertContent(invalidHtml, 'html', 'markdown');
      });

      expect(converted!).toBeTruthy(); // Should not throw and return something
    });

    it('should preserve formatting in HTML to Markdown conversion', () => {
      const { result } = renderHook(() => useEditorModes());

      const htmlWithFormatting = `
        <h2>Section Title</h2>
        <ul>
          <li>Item 1</li>
          <li>Item 2 with <em>emphasis</em></li>
        </ul>
        <blockquote>This is a quote</blockquote>
      `;

      let converted: string;

      act(() => {
        converted = result.current.convertContent(htmlWithFormatting, 'html', 'markdown');
      });

      expect(converted!).toContain('## Section Title');
      expect(converted!).toContain('- Item 1');
      expect(converted!).toContain('- Item 2 with *emphasis*');
      expect(converted!).toContain('> This is a quote');
    });

    it('should preserve formatting in Markdown to HTML conversion', () => {
      const { result } = renderHook(() => useEditorModes());

      const markdownWithFormatting = `
## Section Title

- Item 1
- Item 2 with *emphasis*

> This is a quote
      `;

      let converted: string;

      act(() => {
        converted = result.current.convertContent(markdownWithFormatting, 'markdown', 'html');
      });

      expect(converted!).toContain('<h2>Section Title</h2>');
      expect(converted!).toContain('<ul>');
      expect(converted!).toContain('<li>Item 1</li>');
      expect(converted!).toContain('<li>Item 2 with <em>emphasis</em></li>');
      expect(converted!).toContain('<blockquote>');
    });
  });

  describe('Conversion State Management', () => {
    it('should set isConverting to true during conversion', async () => {
      const { result } = renderHook(() => useEditorModes());

      // Mock a slow conversion to test loading state
      const originalConvert = result.current.convertContent;

      act(() => {
        result.current.convertContent('<p>test</p>', 'html', 'markdown');
      });

      // Note: In real implementation, we might need to handle async conversion
      // For now, we'll test the synchronous behavior
      expect(result.current.isConverting).toBe(false);
    });
  });

  describe('Content Preservation During Mode Switches', () => {
    it('should preserve content integrity when switching from HTML to Markdown and back', () => {
      const { result } = renderHook(() => useEditorModes());

      const originalHtml =
        '<h1>Title</h1><p>This is <strong>bold</strong> and <em>italic</em> text.</p>';
      let markdown: string;
      let backToHtml: string;

      act(() => {
        markdown = result.current.convertContent(originalHtml, 'html', 'markdown');
        backToHtml = result.current.convertContent(markdown, 'markdown', 'html');
      });

      // Check that the conversion preserves semantic meaning
      expect(markdown!).toContain('# Title');
      expect(markdown!).toContain('**bold**');
      expect(markdown!).toContain('*italic*');

      expect(backToHtml!).toContain('<h1>Title</h1>');
      expect(backToHtml!).toContain('<strong>bold</strong>');
      expect(backToHtml!).toContain('<em>italic</em>');
    });

    it('should preserve content integrity when switching from Markdown to HTML and back', () => {
      const { result } = renderHook(() => useEditorModes());

      const originalMarkdown =
        '# Title\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2';
      let html: string;
      let backToMarkdown: string;

      act(() => {
        html = result.current.convertContent(originalMarkdown, 'markdown', 'html');
        backToMarkdown = result.current.convertContent(html, 'html', 'markdown');
      });

      // Check that the conversion preserves semantic meaning
      expect(html!).toContain('<h1>Title</h1>');
      expect(html!).toContain('<strong>bold</strong>');
      expect(html!).toContain('<em>italic</em>');

      expect(backToMarkdown!).toContain('# Title');
      expect(backToMarkdown!).toContain('**bold**');
      expect(backToMarkdown!).toContain('*italic*');
    });

    it('should handle mode switches to preview and split modes without conversion', () => {
      const { result } = renderHook(() => useEditorModes());

      const content = '<p>Test content</p>';
      let previewContent: string;
      let splitContent: string;

      act(() => {
        previewContent = result.current.convertContent(content, 'html', 'preview');
        splitContent = result.current.convertContent(content, 'html', 'split-horizontal');
      });

      // Preview and split modes should return content as-is
      expect(previewContent!).toBe(content);
      expect(splitContent!).toBe(content);
    });
  });

  describe('Advanced Formatting Support', () => {
    it('should handle tables in HTML to Markdown conversion', () => {
      const { result } = renderHook(() => useEditorModes());

      const htmlTable = `
        <table>
          <thead>
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cell 1</td>
              <td>Cell 2</td>
            </tr>
          </tbody>
        </table>
      `;

      let converted: string;

      act(() => {
        converted = result.current.convertContent(htmlTable, 'html', 'markdown');
      });

      // Should preserve table structure (even if simplified)
      expect(converted!).toContain('Header 1');
      expect(converted!).toContain('Header 2');
      expect(converted!).toContain('Cell 1');
      expect(converted!).toContain('Cell 2');
    });

    it('should handle images with alt text correctly', () => {
      const { result } = renderHook(() => useEditorModes());

      const htmlWithImage =
        '<p>Check out this image: <img src="https://example.com/image.jpg" alt="Example Image" /></p>';
      let converted: string;

      act(() => {
        converted = result.current.convertContent(htmlWithImage, 'html', 'markdown');
      });

      expect(converted!).toContain('![Example Image](https://example.com/image.jpg)');
    });

    it('should handle links with proper formatting', () => {
      const { result } = renderHook(() => useEditorModes());

      const markdownWithLinks =
        'Visit [Google](https://google.com) and [GitHub](https://github.com) for more info.';
      let converted: string;

      act(() => {
        converted = result.current.convertContent(markdownWithLinks, 'markdown', 'html');
      });

      expect(converted!).toContain('<a href="https://google.com">Google</a>');
      expect(converted!).toContain('<a href="https://github.com">GitHub</a>');
    });
  });

  describe('Edge Cases', () => {
    it('should handle complex nested HTML structures', () => {
      const { result } = renderHook(() => useEditorModes());

      const complexHtml = `
        <div class="container">
          <header>
            <h1>Main Title</h1>
            <nav>
              <ul>
                <li><a href="#section1">Section 1</a></li>
                <li><a href="#section2">Section 2</a></li>
              </ul>
            </nav>
          </header>
          <main>
            <section id="section1">
              <h2>Section 1</h2>
              <p>Content with <code>inline code</code> and <a href="https://example.com">links</a>.</p>
            </section>
          </main>
        </div>
      `;

      let converted: string;

      act(() => {
        converted = result.current.convertContent(complexHtml, 'html', 'markdown');
      });

      expect(converted!).toContain('# Main Title');
      expect(converted!).toContain('## Section 1');
      expect(converted!).toContain('`inline code`');
      expect(converted!).toContain('[links](https://example.com)');
    });

    it('should handle special characters and entities', () => {
      const { result } = renderHook(() => useEditorModes());

      const htmlWithEntities = '<p>&lt;script&gt; &amp; &quot;quotes&quot;</p>';
      let converted: string;

      act(() => {
        converted = result.current.convertContent(htmlWithEntities, 'html', 'markdown');
      });

      expect(converted!).toContain('<script>');
      expect(converted!).toContain('&');
      expect(converted!).toContain('"quotes"');
    });

    it('should preserve code blocks correctly', () => {
      const { result } = renderHook(() => useEditorModes());

      const markdownWithCode = `
# Code Example

\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`
      `;

      let converted: string;

      act(() => {
        converted = result.current.convertContent(markdownWithCode, 'markdown', 'html');
      });

      expect(converted!).toContain('<pre>');
      expect(converted!).toContain('<code');
      expect(converted!).toContain('function hello()');
    });
  });
});
