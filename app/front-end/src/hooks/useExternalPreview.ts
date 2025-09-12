import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { EditorMode } from './useEditorModes';

export interface UseExternalPreviewReturn {
  externalWindow: Window | null;
  openExternalPreview: () => void;
  closeExternalPreview: () => void;
  updateExternalContent: (content: string) => void;
  isExternalOpen: boolean;
}

/**
 * Convert Markdown to HTML for preview
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
 * Generate complete HTML document for preview
 */
function generatePreviewHtml(content: string, mode: EditorMode): string {
  const processedContent = mode === 'markdown' ? markdownToHtml(content) : content;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      color: #333333;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    
    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 10px; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; color: #6a737d; }
    
    p {
      margin-bottom: 16px;
    }
    
    code {
      background-color: rgba(27, 31, 35, 0.05);
      border-radius: 3px;
      font-size: 85%;
      margin: 0;
      padding: 0.2em 0.4em;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }
    
    pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      font-size: 85%;
      line-height: 1.45;
      overflow: auto;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    pre code {
      background-color: transparent;
      border: 0;
      display: inline;
      line-height: inherit;
      margin: 0;
      max-width: auto;
      overflow: visible;
      padding: 0;
      word-wrap: normal;
    }
    
    blockquote {
      border-left: 4px solid #dfe2e5;
      margin: 0 0 16px 0;
      padding: 0 16px;
      color: #6a737d;
    }
    
    ul, ol {
      margin-bottom: 16px;
      padding-left: 2em;
    }
    
    li {
      margin-bottom: 4px;
    }
    
    a {
      color: #0366d6;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 16px 0;
    }
    
    hr {
      border: none;
      border-top: 1px solid #eaecef;
      margin: 24px 0;
    }
    
    table {
      border-collapse: collapse;
      margin-bottom: 16px;
      width: 100%;
    }
    
    table th,
    table td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
    }
    
    table th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
  </style>
</head>
<body>
  ${processedContent}
</body>
</html>`.trim();
}

/**
 * Debounce utility function
 */
function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

/**
 * Custom hook for managing external preview window functionality
 */
export function useExternalPreview(content: string, mode: EditorMode): UseExternalPreviewReturn {
  const [externalWindow, setExternalWindow] = useState<Window | null>(null);
  const [isExternalOpen, setIsExternalOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if external window is still open
  const checkWindowStatus = useCallback(() => {
    if (externalWindow && externalWindow.closed) {
      setExternalWindow(null);
      setIsExternalOpen(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [externalWindow]);

  // Start monitoring window status
  const startWindowMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(checkWindowStatus, 1000);
  }, [checkWindowStatus]);

  // Stop monitoring window status
  const stopWindowMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const openExternalPreview = useCallback(() => {
    // Don't open a new window if one is already open
    if (externalWindow && !externalWindow.closed) {
      return;
    }

    try {
      const newWindow = window.open(
        '',
        'preview',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (newWindow) {
        setExternalWindow(newWindow);
        setIsExternalOpen(true);
        startWindowMonitoring();

        // Write initial content
        const htmlContent = generatePreviewHtmlMemo(content, mode);
        newWindow.document.open();
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      } else {
        // Handle popup blocker scenario
        setExternalWindow(null);
        setIsExternalOpen(false);
      }
    } catch (error) {
      console.error('Error opening external preview window:', error);
      setExternalWindow(null);
      setIsExternalOpen(false);
    }
  }, [content, mode, externalWindow, startWindowMonitoring]);

  const closeExternalPreview = useCallback(() => {
    if (externalWindow && !externalWindow.closed) {
      try {
        externalWindow.close();
      } catch (error) {
        console.error('Error closing external window:', error);
      }
    }

    setExternalWindow(null);
    setIsExternalOpen(false);
    stopWindowMonitoring();
  }, [externalWindow, stopWindowMonitoring]);

  // Memoize the HTML generation function to avoid recreating it
  const generatePreviewHtmlMemo = useMemo(() => generatePreviewHtml, []);

  const updateExternalContentImmediate = useCallback(
    (newContent: string) => {
      if (!externalWindow || externalWindow.closed) {
        return;
      }

      try {
        const htmlContent = generatePreviewHtmlMemo(newContent, mode);
        externalWindow.document.open();
        externalWindow.document.write(htmlContent);
        externalWindow.document.close();
      } catch (error) {
        console.error('Error updating external window content:', error);
        // If we can't update the window, it might be closed
        checkWindowStatus();
      }
    },
    [externalWindow, mode, checkWindowStatus, generatePreviewHtmlMemo]
  );

  // Debounced version for frequent updates
  const updateExternalContent = useDebounce(updateExternalContentImmediate, 300);

  // Auto-update external window when content or mode changes
  useEffect(() => {
    if (isExternalOpen && externalWindow && !externalWindow.closed) {
      updateExternalContent(content);
    }
  }, [content, mode, isExternalOpen, externalWindow, updateExternalContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (externalWindow && !externalWindow.closed) {
        try {
          externalWindow.close();
        } catch (error) {
          console.error('Error closing window on cleanup:', error);
        }
      }
      stopWindowMonitoring();
    };
  }, [externalWindow, stopWindowMonitoring]);

  return {
    externalWindow,
    openExternalPreview,
    closeExternalPreview,
    updateExternalContent,
    isExternalOpen,
  };
}
