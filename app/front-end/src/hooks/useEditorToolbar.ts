import { useCallback } from 'react';

export interface UseEditorToolbarReturn {
  wrapWithTag: (tag: string, attributes?: string) => void;
  insertContent: (content: string) => void;
  formatSelection: (format: 'bold' | 'italic' | 'code' | 'link') => void;
  insertHeader: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;
  insertList: (type: 'ul' | 'ol') => void;
  getHtmlSuggestions: (text: string, cursorPos: number) => string[];
  formatMarkdown: (format: 'bold' | 'italic' | 'code' | 'strikethrough') => void;
  insertMarkdownHeader: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;
  insertMarkdownList: (type: 'ul' | 'ol') => void;
}

// Common HTML tags for auto-completion
const HTML_TAGS = [
  'div',
  'span',
  'p',
  'a',
  'img',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'code',
  'pre',
  'blockquote',
  'section',
  'article',
  'header',
  'footer',
  'nav',
  'main',
  'aside',
  'table',
  'thead',
  'tbody',
  'tr',
  'td',
  'th',
  'form',
  'input',
  'button',
  'select',
  'option',
  'textarea',
  'label',
  'fieldset',
  'legend',
  'details',
  'summary',
  'figure',
  'figcaption',
  'time',
  'mark',
  'small',
  'sub',
  'sup',
  'del',
  'ins',
  'kbd',
  'samp',
  'var',
];

export function useEditorToolbar(
  textAreaRef: React.RefObject<HTMLTextAreaElement>,
  content: string,
  onChange: (content: string) => void
): UseEditorToolbarReturn {
  const getSelectionInfo = useCallback(() => {
    const textarea = textAreaRef.current;
    if (!textarea) {
      return { start: 0, end: 0, selectedText: '' };
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    return { start, end, selectedText };
  }, [textAreaRef, content]);

  const updateContentAndCursor = useCallback(
    (newContent: string, cursorPos: number, selectionEnd?: number) => {
      onChange(newContent);

      // Update cursor position after content change
      setTimeout(() => {
        const textarea = textAreaRef.current;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPos, selectionEnd ?? cursorPos);
        }
      }, 0);
    },
    [onChange, textAreaRef]
  );

  const wrapWithTag = useCallback(
    (tag: string, attributes?: string) => {
      const { start, end, selectedText } = getSelectionInfo();

      const openTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`;
      const closeTag = `</${tag}>`;

      const before = content.substring(0, start);
      const after = content.substring(end);

      const newContent = `${before}${openTag}${selectedText}${closeTag}${after}`;

      // Position cursor inside the tag if no selection, or after the closing tag if there was selection
      const newCursorStart = selectedText ? start + openTag.length : start + openTag.length;
      const newCursorEnd = selectedText
        ? start + openTag.length + selectedText.length
        : start + openTag.length;

      updateContentAndCursor(newContent, newCursorStart, newCursorEnd);
    },
    [content, getSelectionInfo, updateContentAndCursor]
  );

  const insertContent = useCallback(
    (insertText: string) => {
      const { start, end } = getSelectionInfo();

      const before = content.substring(0, start);
      const after = content.substring(end);

      const newContent = `${before}${insertText}${after}`;
      const newCursorPos = start + insertText.length;

      updateContentAndCursor(newContent, newCursorPos);
    },
    [content, getSelectionInfo, updateContentAndCursor]
  );

  const formatSelection = useCallback(
    (format: 'bold' | 'italic' | 'code' | 'link') => {
      const formatMap = {
        bold: 'strong',
        italic: 'em',
        code: 'code',
        link: 'a',
      };

      const tag = formatMap[format];
      const attributes = format === 'link' ? 'href=""' : undefined;

      wrapWithTag(tag, attributes);
    },
    [wrapWithTag]
  );

  const insertHeader = useCallback(
    (level: 1 | 2 | 3 | 4 | 5 | 6) => {
      wrapWithTag(`h${level}`);
    },
    [wrapWithTag]
  );

  const insertList = useCallback(
    (type: 'ul' | 'ol') => {
      const { start, end, selectedText } = getSelectionInfo();

      const listContent = selectedText
        ? `<${type}>\n  <li>${selectedText}</li>\n</${type}>`
        : `<${type}>\n  <li></li>\n</${type}>`;

      const before = content.substring(0, start);
      const after = content.substring(end);

      const newContent = `${before}${listContent}${after}`;

      // Position cursor inside the list item
      const liStart = before.length + `<${type}>\n  <li>`.length;
      const liEnd = selectedText ? liStart + selectedText.length : liStart;

      updateContentAndCursor(newContent, liStart, liEnd);
    },
    [content, getSelectionInfo, updateContentAndCursor]
  );

  const getHtmlSuggestions = useCallback((text: string, cursorPos: number): string[] => {
    // Find the last '<' before cursor position
    const beforeCursor = text.substring(0, cursorPos);
    const lastOpenBracket = beforeCursor.lastIndexOf('<');

    if (lastOpenBracket === -1) {
      return [];
    }

    // Check if we're inside a tag (no closing '>' after the last '<')
    const afterOpenBracket = beforeCursor.substring(lastOpenBracket + 1);
    if (afterOpenBracket.includes('>')) {
      return [];
    }

    // Get the partial tag name
    const partialTag = afterOpenBracket.toLowerCase();

    // Filter tags that start with the partial input
    return HTML_TAGS.filter(tag => tag.startsWith(partialTag));
  }, []);

  const formatMarkdown = useCallback(
    (format: 'bold' | 'italic' | 'code' | 'strikethrough') => {
      const { start, end, selectedText } = getSelectionInfo();

      const formatMap = {
        bold: '**',
        italic: '*',
        code: '`',
        strikethrough: '~~',
      };

      const marker = formatMap[format];
      const before = content.substring(0, start);
      const after = content.substring(end);

      const newContent = `${before}${marker}${selectedText}${marker}${after}`;

      // Position cursor inside the markers if no selection, or after the closing marker if there was selection
      const newCursorStart = selectedText ? start + marker.length : start + marker.length;
      const newCursorEnd = selectedText
        ? start + marker.length + selectedText.length
        : start + marker.length;

      updateContentAndCursor(newContent, newCursorStart, newCursorEnd);
    },
    [content, getSelectionInfo, updateContentAndCursor]
  );

  const insertMarkdownHeader = useCallback(
    (level: 1 | 2 | 3 | 4 | 5 | 6) => {
      const { start, end, selectedText } = getSelectionInfo();

      const headerPrefix = '#'.repeat(level) + ' ';
      const before = content.substring(0, start);
      const after = content.substring(end);

      const newContent = `${before}${headerPrefix}${selectedText}${after}`;

      // Position cursor after the header prefix if no selection, or after the text if there was selection
      const newCursorPos = selectedText
        ? start + headerPrefix.length + selectedText.length
        : start + headerPrefix.length;

      updateContentAndCursor(newContent, newCursorPos);
    },
    [content, getSelectionInfo, updateContentAndCursor]
  );

  const insertMarkdownList = useCallback(
    (type: 'ul' | 'ol') => {
      const { start, end, selectedText } = getSelectionInfo();

      const listPrefix = type === 'ul' ? '- ' : '1. ';
      const before = content.substring(0, start);
      const after = content.substring(end);

      const newContent = `${before}${listPrefix}${selectedText}${after}`;

      // Position cursor after the list prefix if no selection, or after the text if there was selection
      const newCursorPos = selectedText
        ? start + listPrefix.length + selectedText.length
        : start + listPrefix.length;

      updateContentAndCursor(newContent, newCursorPos);
    },
    [content, getSelectionInfo, updateContentAndCursor]
  );

  return {
    wrapWithTag,
    insertContent,
    formatSelection,
    insertHeader,
    insertList,
    getHtmlSuggestions,
    formatMarkdown,
    insertMarkdownHeader,
    insertMarkdownList,
  };
}
