import React from 'react';
import './SafeHtml.css';

interface SafeHtmlProps {
  html: string | null | undefined;
  className?: string;
}

// Renderiza un string con HTML limitado de forma segura SIN dependencias externas.
// Soporta etiquetas básicas: <code>, <pre>, <strong>, <b>, <em>, <i>, <a>
// Para enlaces valida esquema (http, https, mailto) y añade rel/target.
const SafeHtml: React.FC<SafeHtmlProps> = ({ html, className }) => {
  if (!html) return <span className={className} />;

  // Si no hay DOM (SSR), devolvemos el texto con tags eliminadas
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return <span className={className}>{String(html).replace(/<[^>]+>/g, '')}</span>;
  }

  // Helper para obtener textContent
  const stripHtml = (s: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = s;
    return tmp.textContent || tmp.innerText || '';
  };

  // Parsear el HTML y mapear a React nodes permitidos
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html), 'text/html');

  const isAllowedTag = (tag: string) => {
    return ['CODE', 'PRE', 'STRONG', 'B', 'EM', 'I', 'A', 'SPAN', 'DIV'].includes(tag);
  };

  const sanitizeHref = (href: string) => {
    try {
      const url = new URL(href, window.location.origin);
      const protocol = url.protocol.replace(':', '');
      if (['http', 'https', 'mailto'].includes(protocol)) return url.href;
    } catch (e) {
      // ignore
    }
    return null;
  };

  const domNodeToReact = (node: ChildNode, key?: number | string): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const el = node as Element;
    const tag = el.tagName;

    if (!isAllowedTag(tag)) {
      // por defecto devolvemos solo el texto interior
      return el.textContent || '';
    }

    const children = Array.from(el.childNodes).map((n, i) => domNodeToReact(n, i));

    switch (tag) {
      case 'CODE':
        return (
          <code key={String(key)} className="translation-code">
            {children}
          </code>
        );
      case 'PRE':
        return (
          <pre key={String(key)} className="translation-pre">
            {children}
          </pre>
        );
      case 'STRONG':
      case 'B':
        return (
          <strong key={String(key)} className="translation-strong">
            {children}
          </strong>
        );
      case 'EM':
      case 'I':
        return (
          <em key={String(key)} className="translation-em">
            {children}
          </em>
        );
      case 'A': {
        const hrefAttr = el.getAttribute('href') || '';
        const safeHref = sanitizeHref(hrefAttr);
        if (!safeHref) return children;
        return (
          <a
            key={String(key)}
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="translation-link"
          >
            {children}
          </a>
        );
      }
      case 'SPAN':
      case 'DIV':
        return (
          <span key={String(key)} className="translation-span">
            {children}
          </span>
        );
      default:
        return el.textContent || '';
    }
  };

  const bodyChildren = Array.from(doc.body.childNodes).map((node, i) => domNodeToReact(node, i));

  return <span className={className}>{bodyChildren}</span>;
};

export default SafeHtml;
