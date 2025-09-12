import { useState, useCallback, useMemo } from 'react';

export type EditorMode = 'html' | 'markdown' | 'preview' | 'split-horizontal' | 'split-vertical';

export interface UseEditorModesReturn {
  currentMode: EditorMode;
  setMode: (mode: EditorMode) => void;
  convertContent: (content: string, fromMode: EditorMode, toMode: EditorMode) => string;
  isConverting: boolean;
}

/**
 * Convert HTML to Markdown
 */
function htmlToMarkdown(html: string): string {
  if (!html.trim()) return '';

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const result = convertNodeToMarkdown(tempDiv);
  // Clean up extra newlines at the end
  return result.replace(/\n+$/, '');
}

/**
 * Convert a DOM node to Markdown recursively
 */
function convertNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes)
    .map(child => convertNodeToMarkdown(child))
    .join('');

  switch (tagName) {
    case 'h1':
      return `# ${children}\n\n`;
    case 'h2':
      return `## ${children}\n\n`;
    case 'h3':
      return `### ${children}\n\n`;
    case 'h4':
      return `#### ${children}\n\n`;
    case 'h5':
      return `##### ${children}\n\n`;
    case 'h6':
      return `###### ${children}\n\n`;
    case 'p':
      return `${children}\n\n`;
    case 'strong':
    case 'b':
      return `**${children}**`;
    case 'em':
    case 'i':
      return `*${children}*`;
    case 'code':
      // Handle code blocks vs inline code
      const codeParent = element.parentElement;
      if (codeParent?.tagName.toLowerCase() === 'pre') {
        return children; // Let pre handle the formatting
      }
      return `\`${children}\``;
    case 'pre':
      // Extract language from class if present
      const codeElement = element.querySelector('code');
      if (codeElement) {
        const className = codeElement.className;
        const languageMatch = className.match(/language-(\w+)/);
        const language = languageMatch ? languageMatch[1] : '';
        return `\`\`\`${language}\n${codeElement.textContent || children}\n\`\`\`\n\n`;
      }
      return `\`\`\`\n${children}\n\`\`\`\n\n`;
    case 'blockquote':
      return `> ${children}\n\n`;
    case 'ul':
      return `${children}\n`;
    case 'ol':
      return `${children}\n`;
    case 'li':
      const listParent = element.parentElement;
      const isOrdered = listParent?.tagName.toLowerCase() === 'ol';
      const prefix = isOrdered ? '1. ' : '- ';
      return `${prefix}${children}\n`;
    case 'a':
      const href = element.getAttribute('href') || '';
      return `[${children}](${href})`;
    case 'img':
      const src = element.getAttribute('src') || '';
      const alt = element.getAttribute('alt') || '';
      return `![${alt}](${src})`;
    case 'br':
      return '\n';
    case 'hr':
      return '\n---\n\n';
    case 'table':
      // Basic table support - convert to simple text representation
      return `${children}\n\n`;
    case 'thead':
    case 'tbody':
    case 'tfoot':
      return children;
    case 'tr':
      return `${children}\n`;
    case 'th':
    case 'td':
      return `${children} | `;
    case 'div':
    case 'span':
    case 'section':
    case 'article':
    case 'header':
    case 'main':
    case 'nav':
    case 'aside':
    case 'footer':
      // For container elements, just return the children
      return children;
    default:
      // For unknown elements, preserve the content but not the tags
      return children;
  }
}

/**
 * Convert Markdown to HTML
 */
function markdownToHtml(markdown: string): string {
  if (!markdown.trim()) return '';

  let html = markdown;

  // Code blocks (process first to avoid interference with other patterns)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Inline code (process before other formatting)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers (process in order from h6 to h1 to avoid conflicts)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Bold (process before italic to handle nested formatting)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Images (process before links to avoid conflicts)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Process lists more carefully
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isUnorderedItem = /^-\s+(.+)$/.test(line);
    const isOrderedItem = /^\d+\.\s+(.+)$/.test(line);

    if (isUnorderedItem) {
      if (!inUnorderedList) {
        processedLines.push('<ul>');
        inUnorderedList = true;
      }
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
        processedLines.push('<ul>');
        inUnorderedList = true;
      }
      processedLines.push(line.replace(/^-\s+(.+)$/, '<li>$1</li>'));
    } else if (isOrderedItem) {
      if (!inOrderedList) {
        processedLines.push('<ol>');
        inOrderedList = true;
      }
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
        processedLines.push('<ol>');
        inOrderedList = true;
      }
      processedLines.push(line.replace(/^\d+\.\s+(.+)$/, '<li>$1</li>'));
    } else {
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      processedLines.push(line);
    }
  }

  // Close any remaining lists
  if (inUnorderedList) {
    processedLines.push('</ul>');
  }
  if (inOrderedList) {
    processedLines.push('</ol>');
  }

  html = processedLines.join('\n');

  // Split by double newlines to create paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map(paragraph => {
      const trimmed = paragraph.trim();
      if (!trimmed) return '';

      // Don't wrap headers, lists, blockquotes, pre, hr, or existing HTML tags in paragraphs
      if (trimmed.match(/^<(h[1-6]|ul|ol|blockquote|pre|hr|li)/)) {
        return trimmed;
      }

      // Don't wrap if it's already a complete HTML element
      if (trimmed.match(/^<\w+.*>.*<\/\w+>$/)) {
        return trimmed;
      }

      return `<p>${trimmed}</p>`;
    })
    .filter(p => p)
    .join('\n');

  // Clean up extra newlines
  html = html.replace(/\n+/g, '\n').trim();

  return html;
}

/**
 * Custom hook for managing editor modes and content conversion
 */
export function useEditorModes(initialMode: EditorMode = 'html'): UseEditorModesReturn {
  const [currentMode, setCurrentMode] = useState<EditorMode>(initialMode);
  const [isConverting, setIsConverting] = useState(false);

  const setMode = useCallback((mode: EditorMode) => {
    setCurrentMode(mode);
  }, []);

  // Memoize conversion functions to avoid recreating them on every render
  const htmlToMarkdownMemo = useMemo(() => htmlToMarkdown, []);
  const markdownToHtmlMemo = useMemo(() => markdownToHtml, []);

  const convertContent = useCallback(
    (content: string, fromMode: EditorMode, toMode: EditorMode): string => {
      // If converting to the same mode, return content as-is
      if (fromMode === toMode) {
        return content;
      }

      // Only handle HTML <-> Markdown conversions for now
      // Preview and split modes don't need conversion
      if (fromMode === 'html' && toMode === 'markdown') {
        try {
          setIsConverting(true);
          const result = htmlToMarkdownMemo(content);
          setIsConverting(false);
          return result;
        } catch (error) {
          console.error('Error converting HTML to Markdown:', error);
          setIsConverting(false);
          return content; // Return original content on error
        }
      }

      if (fromMode === 'markdown' && toMode === 'html') {
        try {
          setIsConverting(true);
          const result = markdownToHtmlMemo(content);
          setIsConverting(false);
          return result;
        } catch (error) {
          console.error('Error converting Markdown to HTML:', error);
          setIsConverting(false);
          return content; // Return original content on error
        }
      }

      // For other mode combinations, return content as-is
      return content;
    },
    [htmlToMarkdownMemo, markdownToHtmlMemo]
  );

  return {
    currentMode,
    setMode,
    convertContent,
    isConverting,
  };
}
