// Editor HTML mejorado compatible con React 19
// Versión mejorada del editor temporal
import React, { useState, useRef } from 'react';
import advancedStyles from './AdvancedEditor.module.css';
import styles from './ProjectEditor.module.css';

// Props del editor

interface SimpleLexicalEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Tipos de vista disponibles incluyendo vistas divididas
type ViewMode = 'preview' | 'html' | 'markdown' | 'split-horizontal' | 'split-vertical';

// Editor temporal que funciona con React 19 mientras se implementa la versión completa
const LexicalEditorNew: React.FC<SimpleLexicalEditorProps> = ({
  content,
  onChange,
  placeholder = 'Escribe el contenido de tu artículo aquí...',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('html');
  const [htmlContent, setHtmlContent] = useState<string>(content || '');
  const [showMediaLibrary, setShowMediaLibrary] = useState<boolean>(false);
  const [externalPreview, setExternalPreview] = useState<Window | null>(null);
  // Función para detectar el tipo de contenido
  const detectContentType = (content: string): 'html' | 'markdown' | 'plain' => {
    const hasHtmlTags = /<[^>]+>/.test(content);
    const hasMarkdownSyntax =
      /^#{1,6}\s+|^\-\s+|\*\*[^*]+\*\*|\*[^*\n]+\*|\[.+\]\(.+\)|`[^`]+`/m.test(content);

    if (hasHtmlTags && !hasMarkdownSyntax) {
      return 'html';
    } else if (hasMarkdownSyntax && !hasHtmlTags) {
      return 'markdown';
    } else {
      return 'plain';
    }
  };

  // Función para determinar si se deben mostrar herramientas HTML
  const shouldShowHtmlTools = (): boolean => {
    return (
      viewMode === 'html' ||
      ((viewMode === 'split-horizontal' || viewMode === 'split-vertical') &&
        detectContentType(htmlContent) === 'html')
    );
  };

  // Función para determinar si se deben mostrar herramientas Markdown
  const shouldShowMarkdownTools = (): boolean => {
    return (
      viewMode === 'markdown' ||
      ((viewMode === 'split-horizontal' || viewMode === 'split-vertical') &&
        detectContentType(htmlContent) === 'markdown')
    );
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Función para abrir vista previa en ventana externa
  const openExternalPreview = () => {
    const previewWindow = window.open(
      '',
      'preview',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );

    if (previewWindow) {
      setExternalPreview(previewWindow);
      updateExternalPreview(previewWindow, htmlContent);

      // Listener para detectar cuando se cierra la ventana
      const checkClosed = setInterval(() => {
        if (previewWindow.closed) {
          setExternalPreview(null);
          clearInterval(checkClosed);
        }
      }, 1000);
    }
  };

  // Función para actualizar el contenido de la ventana externa
  const updateExternalPreview = (previewWindow: Window, content: string) => {
    // Siempre convertir a HTML para la ventana externa
    let htmlForPreview = content;

    // Si estamos en modo Markdown, convertir a HTML
    if (viewMode === 'markdown') {
      htmlForPreview = convertMarkdownToHtml(content);
    }

    const previewHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vista Previa - Artículo</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background: #fff;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
            line-height: 1.3;
          }
          h1 { font-size: 2rem; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
          h2 { font-size: 1.5rem; }
          h3 { font-size: 1.25rem; }
          p { margin: 1em 0; }
          img { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; }
          a { color: #6750a4; text-decoration: none; }
          a:hover { text-decoration: underline; }
          code { 
            background: #f3f3f3; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
          }
          pre { 
            background: #f8f8f8; 
            padding: 16px; 
            border-radius: 8px; 
            overflow-x: auto; 
            margin: 1em 0; 
          }
          blockquote {
            border-left: 4px solid #6750a4;
            margin: 1em 0;
            padding-left: 1em;
            color: #666;
            font-style: italic;
          }
          ul, ol { margin: 1em 0; padding-left: 2em; }
          li { margin: 0.5em 0; }
          table { width: 100%; border-collapse: collapse; margin: 1em 0; }
          th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
          th { background: #f5f5f5; font-weight: 600; }
        </style>
      </head>
      <body>
        <div id="content">${htmlForPreview || '<p style="color: #999; text-align: center; margin-top: 50px;">No hay contenido para mostrar</p>'}</div>
        <script>
          // Actualizar automáticamente cuando cambie el contenido
          window.updateContent = function(newContent) {
            document.getElementById('content').innerHTML = newContent || '<p style="color: #999; text-align: center; margin-top: 50px;">No hay contenido para mostrar</p>';
          };
        </script>
      </body>
      </html>
    `;

    previewWindow.document.open();
    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
  };

  // Actualizar ventana externa cuando cambie el contenido
  React.useEffect(() => {
    if (externalPreview && !externalPreview.closed) {
      try {
        // Siempre convertir a HTML para la ventana externa
        let htmlForPreview = htmlContent;
        if (viewMode === 'markdown') {
          htmlForPreview = convertMarkdownToHtml(htmlContent);
        }

        if ((externalPreview as any).updateContent) {
          (externalPreview as any).updateContent(htmlForPreview);
        }
      } catch (error) {
        console.warn('No se pudo actualizar la ventana externa:', error);
      }
    }
  }, [htmlContent, externalPreview, viewMode]);

  // Función para envolver selección con etiqueta HTML
  const wrapWithTag = (tag: string, attributes?: string) => {
    if (textAreaRef.current) {
      const start = textAreaRef.current.selectionStart;
      const end = textAreaRef.current.selectionEnd;
      const selectedText = htmlContent.substring(start, end) || `contenido ${tag}`;

      const openTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`;
      const closeTag = `</${tag}>`;
      const wrappedContent = openTag + selectedText + closeTag;

      const newContent =
        htmlContent.substring(0, start) + wrappedContent + htmlContent.substring(end);

      setHtmlContent(newContent);
      onChange(newContent);

      // Seleccionar el contenido dentro de las etiquetas
      setTimeout(() => {
        if (textAreaRef.current) {
          const newStart = start + openTag.length;
          const newEnd = newStart + selectedText.length;
          textAreaRef.current.focus();
          textAreaRef.current.setSelectionRange(newStart, newEnd);
        }
      }, 50);
    }
  };

  // Función para auto-completado de etiquetas HTML
  const getHtmlSuggestions = (currentText: string, cursorPos: number): string[] => {
    const textBeforeCursor = currentText.substring(0, cursorPos);
    const lastOpenTag = textBeforeCursor.lastIndexOf('<');

    if (lastOpenTag === -1) return [];

    const tagText = textBeforeCursor.substring(lastOpenTag + 1);
    if (tagText.includes('>') || tagText.includes(' ')) return [];

    const commonTags = [
      'div',
      'span',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'a',
      'img',
      'ul',
      'ol',
      'li',
      'table',
      'tr',
      'td',
      'th',
      'section',
      'project',
      'header',
      'footer',
      'nav',
      'main',
      'aside',
      'figure',
      'figcaption',
      'blockquote',
      'code',
      'pre',
      'strong',
      'em',
      'button',
      'input',
      'form',
      'label',
      'select',
      'option',
      'textarea',
    ];

    return commonTags.filter(tag => tag.startsWith(tagText.toLowerCase()));
  };

  // Función helper para aplicar formato inline (negrita, cursiva, etc.)
  const applyInlineFormatting = (text: string): string => {
    let formatted = text;

    // Bold con ** o __
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic con * o _ (evitando conflicto con **)
    formatted = formatted.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
    formatted = formatted.replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');

    // Strikethrough ~~texto~~
    formatted = formatted.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Links [texto](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images ![alt](url)
    formatted = formatted.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<BlurImage src="$2" alt="$1" />');

    // Code inline `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    return formatted;
  };

  // Funciones de conversión Markdown ↔ HTML
  const convertMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';

    // Dividir en líneas para procesamiento más preciso
    const lines = markdown.split('\n');
    const processedLines: string[] = [];
    let inList = false;
    let inOrderedList = false;
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Code blocks (``` o tres espacios/tab al inicio)
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Terminar bloque de código
          const codeContent = codeBlockLines.join('\n');
          processedLines.push('<pre><code>' + codeContent + '</code></pre>');
          codeBlockLines = [];
          inCodeBlock = false;
        } else {
          // Iniciar bloque de código
          inCodeBlock = true;
          if (inList) {
            processedLines.push('</ul>');
            inList = false;
          }
          if (inOrderedList) {
            processedLines.push('</ol>');
            inOrderedList = false;
          }
        }
        continue;
      }

      // Si estamos en un bloque de código, solo recopilar líneas
      if (inCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }

      // Headers - deben estar al principio de la línea (H1-H6)
      if (line.match(/^######\s+(.+)$/)) {
        line = line.replace(/^######\s+(.+)$/, '<h6>$1</h6>');
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
      } else if (line.match(/^#####\s+(.+)$/)) {
        line = line.replace(/^#####\s+(.+)$/, '<h5>$1</h5>');
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
      } else if (line.match(/^####\s+(.+)$/)) {
        line = line.replace(/^####\s+(.+)$/, '<h4>$1</h4>');
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
      } else if (line.match(/^###\s+(.+)$/)) {
        line = line.replace(/^###\s+(.+)$/, '<h3>$1</h3>');
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
      } else if (line.match(/^##\s+(.+)$/)) {
        line = line.replace(/^##\s+(.+)$/, '<h2>$1</h2>');
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
      } else if (line.match(/^#\s+(.+)$/)) {
        line = line.replace(/^#\s+(.+)$/, '<h1>$1</h1>');
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
      }
      // Ordered lists (1. 2. 3.) - mejorado
      else if (line.match(/^(\s*)\d+\.\s+(.+)$/)) {
        let content = RegExp.$2;
        // Aplicar formato inline al contenido antes de envolver en <li>
        content = applyInlineFormatting(content);
        if (!inOrderedList) {
          if (inList) {
            processedLines.push('</ul>');
            inList = false;
          }
          line = '<ol>\n<li>' + content + '</li>';
          inOrderedList = true;
        } else {
          line = '<li>' + content + '</li>';
        }
      }
      // Unordered lists (- + *) - mejorado
      else if (line.match(/^(\s*)[-+*]\s+(.+)$/)) {
        let content = RegExp.$2;
        // Aplicar formato inline al contenido antes de envolver en <li>
        content = applyInlineFormatting(content);
        if (!inList) {
          if (inOrderedList) {
            processedLines.push('</ol>');
            inOrderedList = false;
          }
          line = '<ul>\n<li>' + content + '</li>';
          inList = true;
        } else {
          line = '<li>' + content + '</li>';
        }
      }
      // Tablas simples (| col1 | col2 |)
      else if (line.match(/^\|(.+)\|$/)) {
        const cells = line.split('|').filter(cell => cell.trim() !== '');
        const isHeaderRow = i + 1 < lines.length && lines[i + 1].match(/^\|[-:\s|]+\|$/);

        if (isHeaderRow) {
          const headerCells = cells.map(cell => `<th>${cell.trim()}</th>`).join('');
          line = `<table>\n<thead>\n<tr>${headerCells}</tr>\n</thead>\n<tbody>`;
          i++; // Skip the separator line
        } else {
          const dataCells = cells.map(cell => `<td>${cell.trim()}</td>`).join('');
          line = `<tr>${dataCells}</tr>`;
        }

        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
      }
      // Blockquotes (>)
      else if (line.match(/^>\s*(.*)$/)) {
        line = line.replace(/^>\s*(.*)$/, '<blockquote>$1</blockquote>');
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
      }
      // Horizontal rules (--- or ***)
      else if (line.match(/^[-*]{3,}$/)) {
        line = '<hr>';
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
      }
      // Línea vacía - cerrar listas si están abiertas
      else if (line.trim() === '') {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
        line = '';
      }
      // Línea normal - cerrar listas si están abiertas y procesar formato inline
      else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }

        // Aplicar formato inline si no es un header, blockquote o hr
        if (!line.includes('<h') && !line.includes('<blockquote') && !line.includes('<hr')) {
          line = applyInlineFormatting(line);

          // Envolver en párrafo si no está vacío y no es HTML
          if (
            line.trim() &&
            !line.includes('<h') &&
            !line.includes('<li>') &&
            !line.includes('<blockquote') &&
            !line.includes('<hr')
          ) {
            line = '<p>' + line + '</p>';
          }
        }
      }

      processedLines.push(line);
    }

    // Cerrar listas si quedaron abiertas
    if (inList) {
      processedLines.push('</ul>');
    }
    if (inOrderedList) {
      processedLines.push('</ol>');
    }

    // Cerrar tabla si quedó abierta
    if (
      processedLines.some(
        line => line.includes('<tbody>') && !processedLines.some(l => l.includes('</tbody>'))
      )
    ) {
      processedLines.push('</tbody>\n</table>');
    }

    // Cerrar bloque de código si quedó abierto
    if (inCodeBlock && codeBlockLines.length > 0) {
      const codeContent = codeBlockLines.join('\n');
      processedLines.push('<pre><code>' + codeContent + '</code></pre>');
    }

    return processedLines.join('\n').replace(/\n\n+/g, '\n').trim();
  };

  const convertHtmlToMarkdown = (html: string): string => {
    if (!html) return '';

    let markdown = html;

    // Code blocks
    markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```');

    // Blockquotes
    markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1');

    // Horizontal rules
    markdown = markdown.replace(/<hr[^>]*\/?>/gi, '---');

    // Headers - H1-H6 completo
    markdown = markdown.replace(/<h1[^>]*>\s*(.*?)\s*<\/h1>/gi, '\n# $1\n');
    markdown = markdown.replace(/<h2[^>]*>\s*(.*?)\s*<\/h2>/gi, '\n## $1\n');
    markdown = markdown.replace(/<h3[^>]*>\s*(.*?)\s*<\/h3>/gi, '\n### $1\n');
    markdown = markdown.replace(/<h4[^>]*>\s*(.*?)\s*<\/h4>/gi, '\n#### $1\n');
    markdown = markdown.replace(/<h5[^>]*>\s*(.*?)\s*<\/h5>/gi, '\n##### $1\n');
    markdown = markdown.replace(/<h6[^>]*>\s*(.*?)\s*<\/h6>/gi, '\n###### $1\n');

    // Bold - primero ** luego __
    markdown = markdown.replace(/<strong[^>]*>\s*(.*?)\s*<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b[^>]*>\s*(.*?)\s*<\/b>/gi, '**$1**');

    // Italic - primero * luego _
    markdown = markdown.replace(/<em[^>]*>\s*(.*?)\s*<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i[^>]*>\s*(.*?)\s*<\/i>/gi, '*$1*');

    // Strikethrough
    markdown = markdown.replace(/<del[^>]*>\s*(.*?)\s*<\/del>/gi, '~~$1~~');
    markdown = markdown.replace(/<s[^>]*>\s*(.*?)\s*<\/s>/gi, '~~$1~~');

    // Images
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
    markdown = markdown.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

    // Links
    markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>\s*(.*?)\s*<\/a>/gi, '[$2]($1)');

    // Code inline
    markdown = markdown.replace(/<code[^>]*>\s*(.*?)\s*<\/code>/gi, '`$1`');

    // Lists - mejorado con mejor procesamiento
    markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (_, content) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
      return items
        .map((item: string, index: number) => {
          const text = item.replace(/<li[^>]*>(.*?)<\/li>/gi, '$1').trim();
          return `${index + 1}. ${text}`;
        })
        .join('\n');
    });

    markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_, content) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
      return items
        .map((item: string) => {
          const text = item.replace(/<li[^>]*>(.*?)<\/li>/gi, '$1').trim();
          return `- ${text}`;
        })
        .join('\n');
    });

    // Tablas (conversión básica)
    markdown = markdown.replace(/<table[^>]*>(.*?)<\/table>/gis, (_, content) => {
      let tableMarkdown = '';

      // Procesar thead
      const theadMatch = content.match(/<thead[^>]*>(.*?)<\/thead>/is);
      if (theadMatch) {
        const headerRows = theadMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/gis) || [];
        headerRows.forEach((row: string) => {
          const cells = row.match(/<th[^>]*>(.*?)<\/th>/gi) || [];
          const cellTexts = cells.map((cell: string) =>
            cell.replace(/<th[^>]*>(.*?)<\/th>/gi, '$1').trim()
          );
          tableMarkdown += '| ' + cellTexts.join(' | ') + ' |\n';
          tableMarkdown += '| ' + cellTexts.map(() => '---').join(' | ') + ' |\n';
        });
      }

      // Procesar tbody
      const tbodyMatch = content.match(/<tbody[^>]*>(.*?)<\/tbody>/is);
      if (tbodyMatch) {
        const dataRows = tbodyMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/gis) || [];
        dataRows.forEach((row: string) => {
          const cells = row.match(/<td[^>]*>(.*?)<\/td>/gi) || [];
          const cellTexts = cells.map((cell: string) =>
            cell.replace(/<td[^>]*>(.*?)<\/td>/gi, '$1').trim()
          );
          tableMarkdown += '| ' + cellTexts.join(' | ') + ' |\n';
        });
      }

      return '\n' + tableMarkdown + '\n';
    });

    // Paragraphs
    markdown = markdown.replace(/<p[^>]*>\s*/gi, '');
    markdown = markdown.replace(/\s*<\/p>/gi, '\n\n');

    // Line breaks
    markdown = markdown.replace(/<br[^>]*>/gi, '\n');

    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, '');

    // Clean up whitespace
    markdown = markdown.replace(/\n\n\n+/g, '\n\n');
    markdown = markdown.replace(/^\n+|\n+$/g, '');

    // Fix spacing around headers
    markdown = markdown.replace(/\n(#{1,6}\s+[^\n]+)\n/g, '\n\n$1\n\n');

    return markdown.trim();
  };

  const handleModeConversion = (newMode: ViewMode) => {
    const currentContent = htmlContent.trim();

    if (newMode === 'markdown' && viewMode !== 'markdown') {
      // Converting to Markdown from HTML or other mode
      console.log(
        'Converting to Markdown. Current content:',
        currentContent.substring(0, 100) + '...'
      );

      // Detect if content is HTML
      const hasHtmlTags = /<[^>]+>/.test(currentContent);

      if (hasHtmlTags) {
        console.log('HTML detected, converting to Markdown...');
        const markdownContent = convertHtmlToMarkdown(currentContent);
        console.log('Converted to Markdown:', markdownContent.substring(0, 100) + '...');
        setHtmlContent(markdownContent);
        onChange(markdownContent);
      }
    } else if (newMode === 'html' && viewMode === 'markdown') {
      // Converting from Markdown to HTML
      console.log(
        'Converting from Markdown to HTML. Current content:',
        currentContent.substring(0, 100) + '...'
      );

      // Detect if content looks like Markdown
      const hasMarkdownSyntax =
        /^#{1,6}\s+|^\-\s+|\*\*[^*]+\*\*|\*[^*\n]+\*|\[.+\]\(.+\)|`[^`]+`/.test(currentContent);
      const hasNoHtmlTags = !/<[^>]+>/.test(currentContent);

      if (hasMarkdownSyntax || (hasNoHtmlTags && currentContent.length > 0)) {
        console.log('Markdown detected, converting to HTML...');
        const htmlConverted = convertMarkdownToHtml(currentContent);
        console.log('Converted to HTML:', htmlConverted.substring(0, 100) + '...');
        setHtmlContent(htmlConverted);
        onChange(htmlConverted);
      }
    }

    setViewMode(newMode);
  };

  // Manejador para cambios en el editor
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setHtmlContent(newContent);
    onChange(newContent);
  }; // Renderizar la vista previa
  const renderPreview = () => {
    // Validar si hay contenido para mostrar
    const hasContent = htmlContent && htmlContent.trim() !== '';

    if (!hasContent) {
      return (
        <div className={advancedStyles.contentPreview}>
          <div className={styles.previewPlaceholder}>
            <i
              className="fas fa-eye"
              style={{ fontSize: '24px', opacity: 0.5, marginBottom: '10px' }}
            ></i>
            <span>La vista previa del contenido aparecerá aquí</span>
          </div>
        </div>
      );
    }

    // Determinar si el contenido es Markdown o HTML y convertir si es necesario
    let previewContent = htmlContent;

    // Si estamos en modo Markdown o el contenido parece ser Markdown
    const hasMarkdownSyntax =
      /^#{1,6}\s+|^\-\s+|\*\*[^*]+\*\*|\*[^*\n]+\*|\[.+\]\(.+\)|`[^`]+`/m.test(htmlContent);
    const hasHtmlTags = /<[^>]+>/.test(htmlContent);

    if (viewMode === 'markdown' || (hasMarkdownSyntax && !hasHtmlTags)) {
      // Es contenido Markdown, convertir a HTML para la vista previa
      console.log('Rendering preview: Converting Markdown to HTML for preview');
      previewContent = convertMarkdownToHtml(htmlContent);
    }

    return (
      <div className={advancedStyles.contentPreview}>
        <div
          className={`${advancedStyles.previewContent} project-content`}
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      </div>
    );
  }; // Insertar contenido desde la biblioteca de medios
  const handleMediaSelection = (url: string) => {
    if (textAreaRef.current) {
      const startPos = textAreaRef.current.selectionStart;
      const endPos = textAreaRef.current.selectionEnd;

      // Determinar el tipo de archivo basado en la extensión
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
      const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

      let mediaHtml = '';

      if (isImage) {
        const altText = prompt('Texto alternativo para la imagen:', 'Imagen') || 'Imagen';
        mediaHtml = `<BlurImage src="${url}" alt="${altText}" className="project-image" style="max-width: 100%; height: auto; display: block; margin: 20px 0;" />`;
      } else if (isVideo) {
        mediaHtml = `
<video controls style="max-width: 100%; height: auto; display: block; margin: 20px 0;">
  <source src="${url}" type="video/${url.split('.').pop()}" />
  Tu navegador no soporta la etiqueta de video.
</video>`;
      } else {
        // Otro tipo de archivo - mostrar como enlace
        mediaHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="project-link" style="color: var(--md-sys-color-primary);">${url
          .split('/')
          .pop()}</a>`;
      }

      const newContent =
        htmlContent.substring(0, startPos) + mediaHtml + htmlContent.substring(endPos);

      setHtmlContent(newContent);
      onChange(newContent);
      setShowMediaLibrary(false);

      // Enfoque nuevamente en el textarea después de insertar
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          // Mover el cursor después del contenido insertado
          const newCursorPos = startPos + mediaHtml.length;
          textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 50);
    }
  };
  return (
    <div
      className={`${advancedStyles.advancedEditor} ${
        viewMode === 'split-horizontal'
          ? advancedStyles.splitHorizontal
          : viewMode === 'split-vertical'
            ? advancedStyles.splitVertical
            : ''
      }`}
    >
      {/* Selector de modo de vista */}
      <div className={advancedStyles.editorToolbar}>
        <div className={advancedStyles.viewModeSelector}>
          <button
            className={`${advancedStyles.viewModeBtn} ${
              viewMode === 'html' ? advancedStyles.active : ''
            }`}
            onClick={() => handleModeConversion('html')}
            title="Modo HTML avanzado"
          >
            <i className="fas fa-code"></i> HTML
          </button>
          <button
            className={`${advancedStyles.viewModeBtn} ${
              viewMode === 'markdown' ? advancedStyles.active : ''
            }`}
            onClick={() => handleModeConversion('markdown')}
            title="Modo Markdown"
          >
            <i className="fab fa-markdown"></i> Markdown
          </button>
          <button
            className={`${advancedStyles.viewModeBtn} ${
              viewMode === 'preview' ? advancedStyles.active : ''
            }`}
            onClick={() => setViewMode('preview')}
            title="Solo vista previa"
          >
            <i className="fas fa-eye"></i> Vista previa
          </button>
        </div>

        <div className={advancedStyles.additionalActions}>
          <button
            className={advancedStyles.actionBtn}
            onClick={openExternalPreview}
            title="Abrir vista previa en ventana externa"
          >
            <i className="fas fa-external-link-alt"></i> Ventana externa
          </button>

          <button
            className={`${advancedStyles.actionBtn} ${
              viewMode === 'split-horizontal' ? advancedStyles.active : ''
            }`}
            onClick={() => setViewMode('split-horizontal')}
            title="Vista dividida horizontal (editor arriba, preview abajo)"
          >
            <i className="fas fa-grip-lines"></i> Horizontal
          </button>

          <button
            className={`${advancedStyles.actionBtn} ${
              viewMode === 'split-vertical' ? advancedStyles.active : ''
            }`}
            onClick={() => setViewMode('split-vertical')}
            title="Vista dividida vertical (editor izquierda, preview derecha)"
          >
            <i className="fas fa-grip-vertical"></i> Vertical
          </button>

          {externalPreview && !externalPreview.closed && (
            <span className={styles.externalPreviewIndicator}>
              <i className="fas fa-circle" style={{ color: '#4CAF50', fontSize: '8px' }}></i>
              Ventana activa
            </span>
          )}
        </div>
      </div>

      {/* Contenido del editor */}
      <div className={advancedStyles.editorContent}>
        {/* Área de edición - Mostrar siempre en vistas divididas */}
        {(viewMode === 'html' ||
          viewMode === 'markdown' ||
          viewMode === 'split-horizontal' ||
          viewMode === 'split-vertical') && (
          <div className={advancedStyles.editorContainer}>
            {/* Mostrar barra de herramientas especial para modo HTML o vistas divididas con contenido HTML */}
            {shouldShowHtmlTools() && (
              <div className={styles.htmlModeToolbar}>
                <div className={styles.htmlModeIndicator}>
                  <i className="fas fa-code"></i>
                  <span>Modo HTML Avanzado</span>
                </div>

                {/* Fila principal - Herramientas más usadas */}
                <div className={styles.htmlMainActions}>
                  {/* Formato básico */}
                  <div className={styles.htmlActionGroup}>
                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => wrapWithTag('strong')}
                      title="Texto en negrita"
                    >
                      <i className="fas fa-bold"></i>
                    </button>

                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => wrapWithTag('em')}
                      title="Texto en cursiva"
                    >
                      <i className="fas fa-italic"></i>
                    </button>

                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => wrapWithTag('u')}
                      title="Texto subrayado"
                    >
                      <i className="fas fa-underline"></i>
                    </button>
                  </div>

                  {/* Headers más usados */}
                  <div className={styles.htmlActionGroup}>
                    <select
                      className={styles.htmlHeaderSelect}
                      onChange={e => {
                        if (e.target.value) {
                          wrapWithTag(e.target.value);
                          e.target.value = ''; // Reset select
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Encabezados</option>
                      <option value="h1">H1</option>
                      <option value="h2">H2</option>
                      <option value="h3">H3</option>
                      <option value="h4">H4</option>
                      <option value="h5">H5</option>
                      <option value="h6">H6</option>
                    </select>
                  </div>

                  {/* Elementos estructurales */}
                  <div className={styles.htmlActionGroup}>
                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => wrapWithTag('p')}
                      title="Párrafo"
                    >
                      <i className="fas fa-paragraph"></i>
                    </button>

                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => {
                        const url = prompt('Ingresa la URL:');
                        if (url) {
                          wrapWithTag(
                            'a',
                            `href="${url}" target="_blank" rel="noopener noreferrer"`
                          );
                        }
                      }}
                      title="Insertar enlace"
                    >
                      <i className="fas fa-link"></i>
                    </button>

                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => setShowMediaLibrary(true)}
                      title="Insertar imagen"
                    >
                      <i className="fas fa-image"></i>
                    </button>
                  </div>

                  {/* Listas y tablas */}
                  <div className={styles.htmlActionGroup}>
                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => {
                        if (textAreaRef.current) {
                          const start = textAreaRef.current.selectionStart;
                          const listHtml =
                            '\n<ul>\n  <li>Elemento 1</li>\n  <li>Elemento 2</li>\n</ul>\n';
                          const newContent =
                            htmlContent.substring(0, start) +
                            listHtml +
                            htmlContent.substring(start);
                          setHtmlContent(newContent);
                          onChange(newContent);
                        }
                      }}
                      title="Lista no ordenada"
                    >
                      <i className="fas fa-list-ul"></i>
                    </button>

                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => {
                        if (textAreaRef.current) {
                          const start = textAreaRef.current.selectionStart;
                          const listHtml =
                            '\n<ol>\n  <li>Primer elemento</li>\n  <li>Segundo elemento</li>\n</ol>\n';
                          const newContent =
                            htmlContent.substring(0, start) +
                            listHtml +
                            htmlContent.substring(start);
                          setHtmlContent(newContent);
                          onChange(newContent);
                        }
                      }}
                      title="Lista ordenada"
                    >
                      <i className="fas fa-list-ol"></i>
                    </button>

                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => {
                        if (textAreaRef.current) {
                          const start = textAreaRef.current.selectionStart;
                          const tableHtml =
                            '\n<table>\n  <thead>\n    <tr>\n      <th>Col 1</th>\n      <th>Col 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Dato 1</td>\n      <td>Dato 2</td>\n    </tr>\n  </tbody>\n</table>\n';
                          const newContent =
                            htmlContent.substring(0, start) +
                            tableHtml +
                            htmlContent.substring(start);
                          setHtmlContent(newContent);
                          onChange(newContent);
                        }
                      }}
                      title="Insertar tabla"
                    >
                      <i className="fas fa-table"></i>
                    </button>
                  </div>

                  {/* Código y citas */}
                  <div className={styles.htmlActionGroup}>
                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => wrapWithTag('code')}
                      title="Código inline"
                    >
                      <i className="fas fa-code"></i>
                    </button>

                    <button
                      className={styles.htmlActionBtn}
                      onClick={() => wrapWithTag('blockquote')}
                      title="Cita"
                    >
                      <i className="fas fa-quote-right"></i>
                    </button>
                  </div>

                  {/* Más elementos */}
                  <div className={styles.htmlActionGroup}>
                    <select
                      className={styles.htmlElementSelect}
                      onChange={e => {
                        if (e.target.value && textAreaRef.current) {
                          const cursorPos = textAreaRef.current.selectionStart;
                          const newContent =
                            htmlContent.substring(0, cursorPos) +
                            e.target.value +
                            htmlContent.substring(cursorPos);
                          setHtmlContent(newContent);
                          onChange(newContent);
                          e.target.value = ''; // Reset select
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Más elementos...</option>
                      <option value="<div></div>">div</option>
                      <option value="<span></span>">span</option>
                      <option value="\n<pre><code>código aquí</code></pre>\n">pre + code</option>
                      <option value="\n<hr>\n">hr (línea)</option>
                      <option value="<div></div>">section</option>
                      <option value="<article></article>">project</option>
                      <option value="<header></header>">header</option>
                      <option value="<footer></footer>">footer</option>
                      <option value="<nav></nav>">nav</option>
                      <option value="<main></main>">main</option>
                      <option value="<aside></aside>">aside</option>
                      <option value="<mark></mark>">mark</option>
                      <option value="<small></small>">small</option>
                      <option value="<sub></sub>">sub</option>
                      <option value="<sup></sup>">sup</option>
                    </select>
                  </div>
                </div>

                {/* Fila secundaria - Herramientas de procesamiento */}
                <div className={styles.htmlProcessingActions}>
                  <button
                    className={styles.htmlProcessBtn}
                    onClick={() => {
                      // Formatear HTML con indentación mejorada
                      if (htmlContent.trim()) {
                        try {
                          const formatHTML = (html: string): string => {
                            // Crear un div temporal para limpiar y formatear
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = html;
                            let cleanHtml = tempDiv.innerHTML;

                            // Elementos que no deben tener saltos de línea internos
                            const inlineElements = [
                              'span',
                              'strong',
                              'em',
                              'b',
                              'i',
                              'a',
                              'code',
                              'small',
                              'mark',
                              'sub',
                              'sup',
                            ];

                            // Elementos que siempre deben estar en nueva línea
                            const blockElements = [
                              'div',
                              'p',
                              'h1',
                              'h2',
                              'h3',
                              'h4',
                              'h5',
                              'h6',
                              'ul',
                              'ol',
                              'li',
                              'section',
                              'project',
                              'header',
                              'footer',
                              'nav',
                              'main',
                              'aside',
                              'blockquote',
                              'pre',
                              'table',
                              'thead',
                              'tbody',
                              'tr',
                              'td',
                              'th',
                            ];

                            // Elementos auto-cerrados
                            const selfClosingElements = [
                              'img',
                              'br',
                              'hr',
                              'input',
                              'meta',
                              'link',
                              'area',
                              'base',
                              'col',
                              'embed',
                              'source',
                              'track',
                              'wbr',
                            ];

                            // Aplicar formateo básico
                            blockElements.forEach(tag => {
                              cleanHtml = cleanHtml.replace(
                                new RegExp(`<${tag}([^>]*)>`, 'gi'),
                                `\n<${tag}$1>\n`
                              );
                              cleanHtml = cleanHtml.replace(
                                new RegExp(`</${tag}>`, 'gi'),
                                `\n</${tag}>\n`
                              );
                            });

                            selfClosingElements.forEach(tag => {
                              cleanHtml = cleanHtml.replace(
                                new RegExp(`<${tag}([^>]*)/?>`, 'gi'),
                                `<${tag}$1/>\n`
                              );
                            });

                            // Limpiar espacios excesivos
                            cleanHtml = cleanHtml.replace(/\n\s*\n/g, '\n');
                            cleanHtml = cleanHtml.replace(/^\s+|\s+$/g, '');

                            // Aplicar indentación básica
                            const lines = cleanHtml.split('\n');
                            let indentLevel = 0;
                            const indentSize = '  ';

                            const formattedLines = lines
                              .map(line => {
                                const trimmedLine = line.trim();
                                if (!trimmedLine) return '';

                                if (trimmedLine.startsWith('</')) {
                                  indentLevel = Math.max(0, indentLevel - 1);
                                }

                                const indentedLine = indentSize.repeat(indentLevel) + trimmedLine;

                                if (
                                  trimmedLine.startsWith('<') &&
                                  !trimmedLine.startsWith('</') &&
                                  !trimmedLine.endsWith('/>')
                                ) {
                                  const tagMatch = trimmedLine.match(/<([a-zA-Z][a-zA-Z0-9]*)/);
                                  if (tagMatch) {
                                    const tagName = tagMatch[1].toLowerCase();
                                    const hasClosingTag = trimmedLine.includes(`</${tagName}>`);

                                    if (!inlineElements.includes(tagName) && !hasClosingTag) {
                                      indentLevel++;
                                    }
                                  }
                                }

                                return indentedLine;
                              })
                              .filter(line => line !== '');

                            return formattedLines.join('\n');
                          };

                          const formatted = formatHTML(htmlContent);
                          setHtmlContent(formatted);
                          onChange(formatted);

                          alert('✅ HTML formateado correctamente');
                        } catch (error) {
                          console.error('Error al formatear HTML:', error);
                          alert(
                            '❌ Error al formatear el HTML. Verifica que el código sea válido.'
                          );
                        }
                      }
                    }}
                    title="Formatear HTML con indentación automática"
                  >
                    <i className="fas fa-indent"></i> Formatear
                  </button>

                  <button
                    className={styles.htmlProcessBtn}
                    onClick={() => {
                      // Validar sintaxis HTML sin modificar el contenido
                      if (htmlContent.trim()) {
                        try {
                          const parser = new DOMParser();
                          const doc = parser.parseFromString(htmlContent, 'text/html');

                          const parserErrors = doc.querySelector('parsererror');
                          if (parserErrors) {
                            alert('❌ HTML inválido: Se encontraron errores de sintaxis');
                            return;
                          }

                          const unclosedTags = htmlContent.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g);
                          const closedTags = htmlContent.match(/<\/([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g);

                          let validation = '✅ HTML válido\n\n';
                          validation += `📊 Estadísticas:\n`;
                          validation += `• Etiquetas de apertura: ${unclosedTags ? unclosedTags.length : 0}\n`;
                          validation += `• Etiquetas de cierre: ${closedTags ? closedTags.length : 0}\n`;
                          validation += `• Caracteres: ${htmlContent.length}\n`;
                          validation += `• Líneas: ${htmlContent.split('\n').length}`;

                          alert(validation);
                        } catch (error) {
                          alert(
                            `❌ Error al validar HTML: ${error instanceof Error ? error.message : 'Error desconocido'}`
                          );
                        }
                      } else {
                        alert('ℹ️ No hay contenido para validar');
                      }
                    }}
                    title="Validar sintaxis HTML"
                  >
                    <i className="fas fa-check-circle"></i> Validar
                  </button>

                  <button
                    className={styles.htmlProcessBtn}
                    onClick={() => {
                      // Sanear HTML removiendo elementos peligrosos
                      if (htmlContent.trim()) {
                        try {
                          const sanitizeHTML = (html: string): string => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');

                            const parserErrors = doc.querySelector('parsererror');
                            if (parserErrors) {
                              throw new Error('HTML inválido detectado');
                            }

                            let sanitized = doc.body.innerHTML;

                            // Limpiar atributos peligrosos
                            const dangerousAttributes = [
                              'onclick',
                              'onload',
                              'onerror',
                              'onmouseover',
                              'onfocus',
                              'onblur',
                              'onchange',
                              'onsubmit',
                            ];
                            dangerousAttributes.forEach(attr => {
                              const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
                              sanitized = sanitized.replace(regex, '');
                            });

                            // Limpiar scripts y styles peligrosos
                            sanitized = sanitized.replace(
                              /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                              ''
                            );
                            sanitized = sanitized.replace(
                              /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
                              ''
                            );

                            // Limpiar comentarios
                            sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

                            return sanitized.trim();
                          };

                          const cleaned = sanitizeHTML(htmlContent);
                          setHtmlContent(cleaned);
                          onChange(cleaned);

                          alert('✅ HTML saneado correctamente');
                        } catch (error) {
                          console.error('Error al sanear HTML:', error);
                          alert(
                            `❌ Error al sanear el HTML: ${error instanceof Error ? error.message : 'Error desconocido'}`
                          );
                        }
                      }
                    }}
                    title="Sanear HTML removiendo elementos peligrosos"
                  >
                    <i className="fas fa-shield-alt"></i> Sanear
                  </button>

                  <button
                    className={styles.htmlProcessBtn}
                    onClick={() => {
                      // Minificar HTML removiendo espacios innecesarios
                      if (htmlContent.trim()) {
                        try {
                          const minifyHTML = (html: string): string => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const parserErrors = doc.querySelector('parsererror');

                            if (parserErrors) {
                              throw new Error('No se puede minificar HTML inválido');
                            }

                            let minified = html;

                            // Limpiar comentarios, espacios y saltos de línea
                            minified = minified.replace(/<!--[\s\S]*?-->/g, '');
                            minified = minified.replace(/>\s+</g, '><');
                            minified = minified.replace(/^\s+|\s+$/gm, '');
                            minified = minified.replace(/\n\s*\n/g, '\n');
                            minified = minified.replace(/\s{2,}/g, ' ');
                            minified = minified.replace(/\n/g, '');

                            return minified.trim();
                          };

                          const originalLength = htmlContent.length;
                          const minified = minifyHTML(htmlContent);
                          const newLength = minified.length;
                          const savedBytes = originalLength - newLength;
                          const savedPercentage = ((savedBytes / originalLength) * 100).toFixed(1);

                          setHtmlContent(minified);
                          onChange(minified);

                          alert(
                            `✅ HTML minificado\n📊 Se redujeron ${savedBytes} caracteres (${savedPercentage}%)\nTamaño original: ${originalLength}\nTamaño final: ${newLength}`
                          );
                        } catch (error) {
                          console.error('Error al minificar HTML:', error);
                          alert(
                            `❌ Error al minificar HTML: ${error instanceof Error ? error.message : 'Error desconocido'}`
                          );
                        }
                      }
                    }}
                    title="Minificar HTML reduciendo el tamaño"
                  >
                    <i className="fas fa-compress-alt"></i> Minificar
                  </button>
                </div>
              </div>
            )}

            {/* Mostrar barra de herramientas especial para modo Markdown o vistas divididas con contenido Markdown */}
            {shouldShowMarkdownTools() && (
              <div className={styles.markdownModeToolbar}>
                <div className={styles.markdownModeIndicator}>
                  <i className="fab fa-markdown"></i>
                  <span>Modo Markdown</span>
                </div>
                <div className={styles.markdownModeActions}>
                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const end = textAreaRef.current.selectionEnd;
                        const selectedText = htmlContent.substring(start, end) || 'Encabezado';
                        const newContent =
                          htmlContent.substring(0, start) +
                          `## ${selectedText}` +
                          htmlContent.substring(end);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar encabezado H2"
                  >
                    H2
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const end = textAreaRef.current.selectionEnd;
                        const selectedText = htmlContent.substring(start, end) || 'Encabezado';
                        const newContent =
                          htmlContent.substring(0, start) +
                          `### ${selectedText}` +
                          htmlContent.substring(end);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar encabezado H3"
                  >
                    H3
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const end = textAreaRef.current.selectionEnd;
                        const selectedText = htmlContent.substring(start, end) || 'Encabezado';
                        const newContent =
                          htmlContent.substring(0, start) +
                          `#### ${selectedText}` +
                          htmlContent.substring(end);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar encabezado H4"
                  >
                    H4
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const end = textAreaRef.current.selectionEnd;
                        const selectedText = htmlContent.substring(start, end) || 'Encabezado';
                        const newContent =
                          htmlContent.substring(0, start) +
                          `##### ${selectedText}` +
                          htmlContent.substring(end);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar encabezado H5"
                  >
                    H5
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const end = textAreaRef.current.selectionEnd;
                        const selectedText = htmlContent.substring(start, end) || 'Encabezado';
                        const newContent =
                          htmlContent.substring(0, start) +
                          `###### ${selectedText}` +
                          htmlContent.substring(end);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar encabezado H6"
                  >
                    H6
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const end = textAreaRef.current.selectionEnd;
                        const selectedText =
                          htmlContent.substring(start, end) || 'texto en negrita';
                        const newContent =
                          htmlContent.substring(0, start) +
                          `**${selectedText}**` +
                          htmlContent.substring(end);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Texto en negrita"
                  >
                    <i className="fas fa-bold"></i>
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const end = textAreaRef.current.selectionEnd;
                        const selectedText =
                          htmlContent.substring(start, end) || 'texto en cursiva';
                        const newContent =
                          htmlContent.substring(0, start) +
                          `*${selectedText}*` +
                          htmlContent.substring(end);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Texto en cursiva"
                  >
                    <i className="fas fa-italic"></i>
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const newContent =
                          htmlContent.substring(0, start) +
                          '\n- Elemento de lista\n- Otro elemento' +
                          htmlContent.substring(start);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar lista"
                  >
                    <i className="fas fa-list-ul"></i>
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      const url = prompt('Introduce la URL del enlace:');
                      const text = prompt('Texto del enlace:') || 'enlace';
                      if (url && textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const newContent =
                          htmlContent.substring(0, start) +
                          `[${text}](${url})` +
                          htmlContent.substring(start);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar enlace"
                  >
                    <i className="fas fa-link"></i>
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      // Convertir a HTML y mostrar resultado
                      const htmlConverted = convertMarkdownToHtml(htmlContent);
                      alert(
                        `Vista previa HTML:\n\n${htmlConverted.substring(0, 500)}${htmlConverted.length > 500 ? '...' : ''}`
                      );
                    }}
                    title="Vista previa HTML"
                  >
                    <i className="fas fa-code"></i> HTML
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const newContent =
                          htmlContent.substring(0, start) +
                          '\n1. Primer elemento\n2. Segundo elemento\n3. Tercer elemento' +
                          htmlContent.substring(start);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar lista numerada"
                  >
                    <i className="fas fa-list-ol"></i>
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const end = textAreaRef.current.selectionEnd;
                        const selectedText = htmlContent.substring(start, end) || 'texto citado';
                        const newContent =
                          htmlContent.substring(0, start) +
                          `> ${selectedText}` +
                          htmlContent.substring(end);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar cita"
                  >
                    <i className="fas fa-quote-right"></i>
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const newContent =
                          htmlContent.substring(0, start) +
                          '\n```\nCódigo aquí\n```\n' +
                          htmlContent.substring(start);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar bloque de código"
                  >
                    <i className="fas fa-code"></i>
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const newContent =
                          htmlContent.substring(0, start) +
                          '\n---\n' +
                          htmlContent.substring(start);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar línea horizontal"
                  >
                    <i className="fas fa-minus"></i>
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      if (textAreaRef.current) {
                        const start = textAreaRef.current.selectionStart;
                        const tableTemplate =
                          '\n| Columna 1 | Columna 2 | Columna 3 |\n| --- | --- | --- |\n| Fila 1 | Dato 1 | Dato 2 |\n| Fila 2 | Dato 3 | Dato 4 |\n';
                        const newContent =
                          htmlContent.substring(0, start) +
                          tableTemplate +
                          htmlContent.substring(start);
                        setHtmlContent(newContent);
                        onChange(newContent);
                      }
                    }}
                    title="Insertar tabla"
                  >
                    <i className="fas fa-table"></i>
                  </button>

                  {/* Separador visual */}
                  <div
                    style={{ borderLeft: '1px solid #ccc', height: '24px', margin: '0 10px' }}
                  ></div>

                  {/* Herramientas de procesamiento Markdown */}
                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      // Formatear Markdown con estructura mejorada
                      if (htmlContent.trim()) {
                        try {
                          const formatMarkdown = (markdown: string): string => {
                            const lines = markdown.split('\n');
                            const formattedLines: string[] = [];
                            let inCodeBlock = false;
                            let inList = false;

                            for (let i = 0; i < lines.length; i++) {
                              let line = lines[i];

                              // Detectar bloques de código
                              if (line.trim().startsWith('```')) {
                                inCodeBlock = !inCodeBlock;
                                formattedLines.push(line);
                                continue;
                              }

                              // No formatear dentro de bloques de código
                              if (inCodeBlock) {
                                formattedLines.push(line);
                                continue;
                              }

                              // Formatear headers - agregar espacios después de #
                              if (line.match(/^#+\s*.+/)) {
                                const headerMatch = line.match(/^(#+)\s*(.+)$/);
                                if (headerMatch) {
                                  line = headerMatch[1] + ' ' + headerMatch[2].trim();
                                  // Agregar líneas vacías antes y después de headers
                                  if (
                                    i > 0 &&
                                    formattedLines[formattedLines.length - 1].trim() !== ''
                                  ) {
                                    formattedLines.push('');
                                  }
                                  formattedLines.push(line);
                                  if (i < lines.length - 1 && lines[i + 1].trim() !== '') {
                                    formattedLines.push('');
                                  }
                                  continue;
                                }
                              }

                              // Formatear listas
                              const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s*(.+)$/);
                              if (listMatch) {
                                const indent = listMatch[1];
                                const marker = listMatch[2];
                                const content = listMatch[3];
                                const currentLevel = Math.floor(indent.length / 2);

                                if (!inList && currentLevel === 0) {
                                  // Agregar línea vacía antes de la lista
                                  if (
                                    i > 0 &&
                                    formattedLines[formattedLines.length - 1].trim() !== ''
                                  ) {
                                    formattedLines.push('');
                                  }
                                }

                                inList = true;
                                line = '  '.repeat(currentLevel) + marker + ' ' + content;
                              } else if (inList && line.trim() === '') {
                                // Mantener líneas vacías en listas para sub-elementos
                                formattedLines.push(line);
                                continue;
                              } else if (inList && !line.match(/^\s*$/)) {
                                // Salir de lista si no es elemento de lista ni línea vacía
                                inList = false;
                                // Agregar línea vacía después de la lista
                                if (formattedLines[formattedLines.length - 1].trim() !== '') {
                                  formattedLines.push('');
                                }
                              }

                              // Formatear enlaces - asegurar formato correcto
                              line = line.replace(/\[([^\]]+)\]\s*\(\s*([^)]+)\s*\)/g, '[$1]($2)');

                              // Formatear imágenes - asegurar formato correcto
                              line = line.replace(
                                /!\[([^\]]*)\]\s*\(\s*([^)]+)\s*\)/g,
                                '![$1]($2)'
                              );

                              formattedLines.push(line);
                            }

                            // Limpiar líneas vacías múltiples
                            const cleaned = formattedLines.join('\n').replace(/\n{3,}/g, '\n\n');
                            return cleaned.trim();
                          };

                          const formatted = formatMarkdown(htmlContent);
                          setHtmlContent(formatted);
                          onChange(formatted);

                          alert('✅ Markdown formateado correctamente');
                        } catch (error) {
                          console.error('Error al formatear Markdown:', error);
                          alert('❌ Error al formatear el Markdown. Verifica la sintaxis.');
                        }
                      }
                    }}
                    title="Formatear Markdown con estructura mejorada"
                  >
                    <i className="fas fa-indent"></i> Formatear
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      // Validar sintaxis Markdown
                      if (htmlContent.trim()) {
                        try {
                          let validation = '✅ Markdown válido\n\n';
                          const warnings: string[] = [];

                          // Estadísticas básicas
                          const lines = htmlContent.split('\n');
                          const headers = htmlContent.match(/^#+\s/gm) || [];
                          const links = htmlContent.match(/\[.+\]\(.+\)/g) || [];
                          const images = htmlContent.match(/!\[.*\]\(.+\)/g) || [];
                          const codeBlocks = htmlContent.match(/```[\s\S]*?```/g) || [];
                          const inlineCode = htmlContent.match(/`[^`]+`/g) || [];
                          const lists = htmlContent.match(/^[\s]*[-*+]\s+.+$/gm) || [];
                          const orderedLists = htmlContent.match(/^[\s]*\d+\.\s+.+$/gm) || [];

                          // Verificaciones de validez
                          // 1. Enlaces mal formados
                          const badLinks = htmlContent.match(/\[[^\]]*\]\([^)]*$/gm);
                          if (badLinks) {
                            warnings.push(`⚠️ ${badLinks.length} enlace(s) mal formado(s)`);
                          }

                          // 2. Imágenes mal formadas
                          const badImages = htmlContent.match(/!\[[^\]]*\]\([^)]*$/gm);
                          if (badImages) {
                            warnings.push(`⚠️ ${badImages.length} imagen(es) mal formada(s)`);
                          }

                          // 3. Bloques de código sin cerrar
                          const codeBlockStarts = (htmlContent.match(/```/g) || []).length;
                          if (codeBlockStarts % 2 !== 0) {
                            warnings.push('⚠️ Bloque de código sin cerrar');
                          }

                          // 4. Headers sin espacio después de #
                          const badHeaders = htmlContent.match(/^#+[^#\s]/gm);
                          if (badHeaders) {
                            warnings.push(
                              `⚠️ ${badHeaders.length} encabezado(s) sin espacio después de #`
                            );
                          }

                          validation += `📊 Estadísticas:\n`;
                          validation += `• Líneas: ${lines.length}\n`;
                          validation += `• Encabezados: ${headers.length}\n`;
                          validation += `• Enlaces: ${links.length}\n`;
                          validation += `• Imágenes: ${images.length}\n`;
                          validation += `• Bloques de código: ${codeBlocks.length}\n`;
                          validation += `• Código inline: ${inlineCode.length}\n`;
                          validation += `• Listas: ${lists.length + orderedLists.length}\n`;
                          validation += `• Palabras: ${htmlContent.split(/\s+/).filter(w => w.length > 0).length}\n`;
                          validation += `• Caracteres: ${htmlContent.length}`;

                          if (warnings.length > 0) {
                            validation += '\n\n⚠️ Advertencias:\n' + warnings.join('\n');
                          }

                          alert(validation);
                        } catch (error) {
                          alert(
                            `❌ Error al validar Markdown: ${error instanceof Error ? error.message : 'Error desconocido'}`
                          );
                        }
                      } else {
                        alert('ℹ️ No hay contenido para validar');
                      }
                    }}
                    title="Validar sintaxis Markdown"
                  >
                    <i className="fas fa-check-circle"></i> Validar
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      // Limpiar Markdown removiendo elementos innecesarios
                      if (htmlContent.trim()) {
                        try {
                          const cleanMarkdown = (markdown: string): string => {
                            let cleaned = markdown;

                            // Remover líneas vacías múltiples (más de 2)
                            cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

                            // Normalizar espacios en headers
                            cleaned = cleaned.replace(/^(#+)\s+(.+)$/gm, '$1 $2');

                            // Remover espacios al final de líneas
                            cleaned = cleaned.replace(/[ \t]+$/gm, '');

                            // Normalizar enlaces - remover espacios innecesarios
                            cleaned = cleaned.replace(
                              /\[\s*([^\]]+)\s*\]\s*\(\s*([^)]+)\s*\)/g,
                              '[$1]($2)'
                            );

                            // Normalizar imágenes
                            cleaned = cleaned.replace(
                              /!\[\s*([^\]]*)\s*\]\s*\(\s*([^)]+)\s*\)/g,
                              '![$1]($2)'
                            );

                            // Normalizar listas - asegurar espacios correctos
                            cleaned = cleaned.replace(/^(\s*)([-*+])\s*(.+)$/gm, '$1$2 $3');
                            cleaned = cleaned.replace(/^(\s*)(\d+\.)\s*(.+)$/gm, '$1$2 $3');

                            // Normalizar código inline - remover espacios internos
                            cleaned = cleaned.replace(/`\s+([^`]+)\s+`/g, '`$1`');

                            // Remover espacios antes y después del contenido
                            cleaned = cleaned.trim();

                            return cleaned;
                          };

                          const originalLength = htmlContent.length;
                          const cleaned = cleanMarkdown(htmlContent);
                          const newLength = cleaned.length;
                          const savedBytes = originalLength - newLength;

                          setHtmlContent(cleaned);
                          onChange(cleaned);

                          alert(
                            `✅ Markdown limpiado correctamente\n📊 Mejoras aplicadas:\n• Espacios removidos: ${savedBytes > 0 ? savedBytes + ' caracteres' : 'Ninguno'}\n• Formato normalizado\n• Líneas vacías optimizadas`
                          );
                        } catch (error) {
                          console.error('Error al limpiar Markdown:', error);
                          alert(
                            `❌ Error al limpiar el Markdown: ${error instanceof Error ? error.message : 'Error desconocido'}`
                          );
                        }
                      }
                    }}
                    title="Limpiar y normalizar formato Markdown"
                  >
                    <i className="fas fa-broom"></i> Limpiar
                  </button>

                  <button
                    className={styles.markdownActionBtn}
                    onClick={() => {
                      // Generar tabla de contenidos automática
                      if (htmlContent.trim()) {
                        try {
                          const generateTOC = (markdown: string): string => {
                            const lines = markdown.split('\n');
                            const headers: Array<{ level: number; text: string; anchor: string }> =
                              [];

                            // Encontrar todos los headers
                            lines.forEach(line => {
                              const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
                              if (headerMatch) {
                                const level = headerMatch[1].length;
                                const text = headerMatch[2].trim();
                                const anchor = text
                                  .toLowerCase()
                                  .replace(/[^\w\s-]/g, '')
                                  .replace(/\s+/g, '-')
                                  .replace(/-+/g, '-')
                                  .replace(/^-|-$/g, '');

                                headers.push({ level, text, anchor });
                              }
                            });

                            if (headers.length === 0) {
                              throw new Error(
                                'No se encontraron encabezados para generar tabla de contenidos'
                              );
                            }

                            // Generar TOC
                            let toc = '## Tabla de Contenidos\n\n';
                            headers.forEach(header => {
                              const indent = '  '.repeat(Math.max(0, header.level - 2));
                              toc += `${indent}- [${header.text}](#${header.anchor})\n`;
                            });
                            toc += '\n';

                            return toc;
                          };

                          const toc = generateTOC(htmlContent);

                          // Insertar TOC al principio del documento (después del primer header si existe)
                          const lines = htmlContent.split('\n');
                          let insertPosition = 0;

                          // Buscar el primer header H1
                          for (let i = 0; i < lines.length; i++) {
                            if (lines[i].match(/^#\s+.+$/)) {
                              insertPosition = i + 1;
                              break;
                            }
                          }

                          const newContent = [
                            ...lines.slice(0, insertPosition),
                            '',
                            toc,
                            ...lines.slice(insertPosition),
                          ].join('\n');

                          setHtmlContent(newContent);
                          onChange(newContent);

                          alert('✅ Tabla de contenidos generada correctamente');
                        } catch (error) {
                          console.error('Error al generar TOC:', error);
                          alert(
                            `❌ ${error instanceof Error ? error.message : 'Error al generar tabla de contenidos'}`
                          );
                        }
                      }
                    }}
                    title="Generar tabla de contenidos automática"
                  >
                    <i className="fas fa-list-alt"></i> TOC
                  </button>
                </div>
              </div>
            )}

            <textarea
              ref={textAreaRef}
              className={`${styles.simpleEditor} ${viewMode === 'html' ? styles.htmlModeEditor : ''}`}
              value={htmlContent}
              onChange={handleTextAreaChange}
              onKeyDown={e => {
                // Auto-indentación al presionar Enter
                if (e.key === 'Enter') {
                  const cursorPos = e.currentTarget.selectionStart;
                  const textBeforeCursor = htmlContent.substring(0, cursorPos);

                  // Encuentra la indentación de la línea actual
                  const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
                  const currentLine = textBeforeCursor.substring(lastNewlineIndex + 1);
                  const match = currentLine.match(/^(\s+)/);
                  const indentation = match ? match[1] : '';

                  // Si estamos dentro de una etiqueta, añadir indentación extra
                  let extraIndent = '';
                  if (textBeforeCursor.endsWith('<')) {
                    extraIndent = '  ';
                  }

                  // Si la línea termina con una etiqueta de apertura, agregar indentación
                  if (
                    textBeforeCursor.trim().endsWith('>') &&
                    !textBeforeCursor.trim().endsWith('/>') &&
                    !textBeforeCursor.trim().match(/<\/[^>]+>$/)
                  ) {
                    extraIndent = '  ';
                  }

                  if (indentation || extraIndent) {
                    e.preventDefault();
                    const newContent =
                      textBeforeCursor +
                      '\n' +
                      indentation +
                      extraIndent +
                      htmlContent.substring(cursorPos);

                    setHtmlContent(newContent);
                    onChange(newContent);

                    // Mueve el cursor a la posición correcta después de insertar el texto
                    setTimeout(() => {
                      if (textAreaRef.current) {
                        const newCursorPos =
                          cursorPos + 1 + indentation.length + extraIndent.length;
                        textAreaRef.current.selectionStart = newCursorPos;
                        textAreaRef.current.selectionEnd = newCursorPos;
                      }
                    }, 0);
                  }
                }

                // Auto-cerrar paréntesis, corchetes, llaves y comillas
                if (
                  e.key === '(' ||
                  e.key === '[' ||
                  e.key === '{' ||
                  e.key === '"' ||
                  e.key === "'"
                ) {
                  const pairs: Record<string, string> = {
                    '(': ')',
                    '[': ']',
                    '{': '}',
                    '"': '"',
                    "'": "'",
                  };

                  e.preventDefault();

                  const cursorPos = e.currentTarget.selectionStart;
                  const selectionEnd = e.currentTarget.selectionEnd;

                  const newContent =
                    htmlContent.substring(0, cursorPos) +
                    e.key +
                    (cursorPos === selectionEnd ? pairs[e.key] : '') +
                    htmlContent.substring(selectionEnd);

                  setHtmlContent(newContent);
                  onChange(newContent);

                  // Mover el cursor entre los caracteres insertados
                  setTimeout(() => {
                    if (textAreaRef.current && cursorPos === selectionEnd) {
                      const newPos = cursorPos + 1;
                      textAreaRef.current.selectionStart = newPos;
                      textAreaRef.current.selectionEnd = newPos;
                    }
                  }, 0);
                }

                // Auto-cerrar etiquetas HTML
                if (e.key === '>' && textAreaRef.current) {
                  const cursorPos = e.currentTarget.selectionStart;
                  const textBeforeCursor = htmlContent.substring(0, cursorPos);

                  // Verificar si estamos cerrando una etiqueta de apertura
                  const openTagMatch = textBeforeCursor.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*$/);
                  if (
                    openTagMatch &&
                    !textBeforeCursor.endsWith('/>') &&
                    !['br', 'img', 'input', 'hr', 'meta', 'link'].includes(openTagMatch[1])
                  ) {
                    e.preventDefault();

                    const newContent = textBeforeCursor + '>' + htmlContent.substring(cursorPos);

                    setHtmlContent(newContent);
                    onChange(newContent);

                    // Actualizar la posición del cursor
                    setTimeout(() => {
                      if (textAreaRef.current) {
                        const newPos = cursorPos + 1;
                        textAreaRef.current.selectionStart = newPos;
                        textAreaRef.current.selectionEnd = newPos;
                      }
                    }, 0);
                  }
                }

                // Atajos de teclado para modo HTML
                if (viewMode === 'html' && (e.ctrlKey || e.metaKey)) {
                  switch (e.key) {
                    case 'b':
                      e.preventDefault();
                      wrapWithTag('strong');
                      break;
                    case 'i':
                      e.preventDefault();
                      wrapWithTag('em');
                      break;
                    case 'u':
                      e.preventDefault();
                      wrapWithTag('u');
                      break;
                    case 'k':
                      e.preventDefault();
                      const url = prompt('Ingresa la URL:');
                      if (url) {
                        wrapWithTag('a', `href="${url}"`);
                      }
                      break;
                    case '/':
                      e.preventDefault();
                      // Comentar/descomentar línea
                      const cursorPos = e.currentTarget.selectionStart;
                      const textBeforeCursor = htmlContent.substring(0, cursorPos);
                      const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
                      const nextNewlineIndex = htmlContent.indexOf('\n', cursorPos);
                      const lineStart = lastNewlineIndex + 1;
                      const lineEnd =
                        nextNewlineIndex === -1 ? htmlContent.length : nextNewlineIndex;
                      const currentLine = htmlContent.substring(lineStart, lineEnd);

                      let newLine;
                      if (
                        currentLine.trim().startsWith('<!--') &&
                        currentLine.trim().endsWith('-->')
                      ) {
                        // Descomentar
                        newLine = currentLine.replace(/^\s*<!--\s?/, '').replace(/\s?-->\s*$/, '');
                      } else {
                        // Comentar
                        newLine = `<!-- ${currentLine.trim()} -->`;
                      }

                      const newContent =
                        htmlContent.substring(0, lineStart) +
                        newLine +
                        htmlContent.substring(lineEnd);

                      setHtmlContent(newContent);
                      onChange(newContent);
                      break;
                  }
                }

                // Atajos de teclado para modo Markdown
                if (viewMode === 'markdown' && (e.ctrlKey || e.metaKey)) {
                  switch (e.key) {
                    case 'b':
                      e.preventDefault();
                      // Envolver con **texto**
                      const startB = e.currentTarget.selectionStart;
                      const endB = e.currentTarget.selectionEnd;
                      const selectedTextB =
                        htmlContent.substring(startB, endB) || 'texto en negrita';
                      const newContentB =
                        htmlContent.substring(0, startB) +
                        `**${selectedTextB}**` +
                        htmlContent.substring(endB);
                      setHtmlContent(newContentB);
                      onChange(newContentB);
                      break;
                    case 'i':
                      e.preventDefault();
                      // Envolver con *texto*
                      const startI = e.currentTarget.selectionStart;
                      const endI = e.currentTarget.selectionEnd;
                      const selectedTextI =
                        htmlContent.substring(startI, endI) || 'texto en cursiva';
                      const newContentI =
                        htmlContent.substring(0, startI) +
                        `*${selectedTextI}*` +
                        htmlContent.substring(endI);
                      setHtmlContent(newContentI);
                      onChange(newContentI);
                      break;
                    case 'k':
                      e.preventDefault();
                      // Insertar enlace [texto](url)
                      const urlMd = prompt('Ingresa la URL:');
                      const textMd = prompt('Texto del enlace:') || 'enlace';
                      if (urlMd) {
                        const startK = e.currentTarget.selectionStart;
                        const newContentK =
                          htmlContent.substring(0, startK) +
                          `[${textMd}](${urlMd})` +
                          htmlContent.substring(startK);
                        setHtmlContent(newContentK);
                        onChange(newContentK);
                      }
                      break;
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                      e.preventDefault();
                      // Insertar encabezado # ## ### #### ##### ######
                      const level = parseInt(e.key);
                      const hashesCount = '#'.repeat(level);
                      const startH = e.currentTarget.selectionStart;
                      const endH = e.currentTarget.selectionEnd;
                      const selectedTextH =
                        htmlContent.substring(startH, endH) || `Encabezado ${level}`;
                      const newContentH =
                        htmlContent.substring(0, startH) +
                        `${hashesCount} ${selectedTextH}` +
                        htmlContent.substring(endH);
                      setHtmlContent(newContentH);
                      onChange(newContentH);
                      break;
                    case '`':
                      e.preventDefault();
                      // Insertar código inline o bloque
                      const startC = e.currentTarget.selectionStart;
                      const endC = e.currentTarget.selectionEnd;
                      const selectedTextC = htmlContent.substring(startC, endC);
                      if (selectedTextC.includes('\n')) {
                        // Bloque de código
                        const newContentC =
                          htmlContent.substring(0, startC) +
                          `\`\`\`\n${selectedTextC}\n\`\`\`` +
                          htmlContent.substring(endC);
                        setHtmlContent(newContentC);
                        onChange(newContentC);
                      } else {
                        // Código inline
                        const text = selectedTextC || 'código';
                        const newContentC =
                          htmlContent.substring(0, startC) +
                          `\`${text}\`` +
                          htmlContent.substring(endC);
                        setHtmlContent(newContentC);
                        onChange(newContentC);
                      }
                      break;
                    case 'q':
                      e.preventDefault();
                      // Insertar blockquote
                      const startQ = e.currentTarget.selectionStart;
                      const endQ = e.currentTarget.selectionEnd;
                      const selectedTextQ = htmlContent.substring(startQ, endQ) || 'texto citado';
                      const newContentQ =
                        htmlContent.substring(0, startQ) +
                        `> ${selectedTextQ}` +
                        htmlContent.substring(endQ);
                      setHtmlContent(newContentQ);
                      onChange(newContentQ);
                      break;
                    case 't':
                      e.preventDefault();
                      // Insertar tabla
                      const startT = e.currentTarget.selectionStart;
                      const tableTemplate =
                        '\n| Columna 1 | Columna 2 | Columna 3 |\n| --- | --- | --- |\n| Fila 1 | Dato 1 | Dato 2 |\n| Fila 2 | Dato 3 | Dato 4 |\n';
                      const newContentT =
                        htmlContent.substring(0, startT) +
                        tableTemplate +
                        htmlContent.substring(startT);
                      setHtmlContent(newContentT);
                      onChange(newContentT);
                      break;
                  }
                }

                // Sugerencias de auto-completado para etiquetas HTML
                if (viewMode === 'html' && textAreaRef.current) {
                  const cursorPos = e.currentTarget.selectionStart;
                  const suggestions = getHtmlSuggestions(htmlContent, cursorPos);

                  if (suggestions.length > 0) {
                    // Mostrar las sugerencias en un tooltip o lista desplegable
                    console.log('Sugerencias:', suggestions);
                  }
                }
              }}
              placeholder={
                viewMode === 'html'
                  ? 'Modo HTML avanzado - Usa Ctrl+B (negrita), Ctrl+I (cursiva), Ctrl+U (subrayado), Ctrl+K (enlace), Ctrl+/ (comentar)'
                  : viewMode === 'markdown'
                    ? 'Modo Markdown - Usa # para títulos, **negrita**, *cursiva*, - para listas, [texto](url) para enlaces'
                    : placeholder
              }
              spellCheck={false}
              autoComplete="off"
              style={{
                width: '100%',
                minHeight:
                  viewMode === 'split-horizontal'
                    ? '200px'
                    : viewMode === 'split-vertical'
                      ? '300px'
                      : viewMode === 'html' || viewMode === 'markdown'
                        ? '400px'
                        : '300px',
                padding: '10px',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: viewMode === 'html' || viewMode === 'markdown' ? '13px' : '14px',
                border: `1px solid ${viewMode === 'html' || viewMode === 'markdown' ? 'var(--md-sys-color-primary)' : '#ddd'}`,
                borderRadius: '4px',
                lineHeight: '1.5',
                tabSize: 2,
                backgroundColor:
                  viewMode === 'html'
                    ? 'var(--md-sys-color-surface-container)'
                    : viewMode === 'markdown'
                      ? 'var(--md-sys-color-surface-variant)'
                      : 'white',
                color:
                  viewMode === 'html' || viewMode === 'markdown'
                    ? 'var(--md-sys-color-on-surface)'
                    : 'inherit',
              }}
            />
          </div>
        )}

        {/* Barra de estado para modo HTML o vistas divididas con contenido HTML */}
        {shouldShowHtmlTools() && (
          <div className={styles.htmlStatusBar}>
            <div className={styles.htmlStats}>
              <span>Líneas: {htmlContent.split('\n').length}</span>
              <span>Caracteres: {htmlContent.length}</span>
              <span>Etiquetas: {(htmlContent.match(/<[^>]+>/g) || []).length}</span>
            </div>
            <div className={styles.htmlShortcuts}>
              <span>Ctrl+B: Negrita</span>
              <span>Ctrl+I: Cursiva</span>
              <span>Ctrl+K: Enlace</span>
              <span>Ctrl+/: Comentar</span>
            </div>
          </div>
        )}

        {/* Barra de estado para modo Markdown o vistas divididas con contenido Markdown */}
        {shouldShowMarkdownTools() && (
          <div className={styles.markdownStatusBar}>
            <div className={styles.markdownStats}>
              <span>Líneas: {htmlContent.split('\n').length}</span>
              <span>
                Palabras: {htmlContent.split(/\s+/).filter(word => word.length > 0).length}
              </span>
              <span>Caracteres: {htmlContent.length}</span>
              <span>Títulos: {(htmlContent.match(/^#+\s/gm) || []).length}</span>
            </div>
            <div className={styles.markdownShortcuts}>
              <span>Ctrl+1-6: Títulos</span>
              <span>Ctrl+B: **Negrita**</span>
              <span>Ctrl+I: *Cursiva*</span>
              <span>Ctrl+K: [enlace](url)</span>
              <span>Ctrl+Q: {'>'} Cita</span>
              <span>Ctrl+T: Tabla</span>
            </div>
          </div>
        )}

        {/* Vista previa - Mostrar tanto en modo preview como en vistas divididas */}
        {(viewMode === 'preview' ||
          viewMode === 'split-horizontal' ||
          viewMode === 'split-vertical') && (
          <div className={advancedStyles.previewContainer}>{renderPreview()}</div>
        )}
      </div>
    </div>
  );
};

export default LexicalEditorNew;
