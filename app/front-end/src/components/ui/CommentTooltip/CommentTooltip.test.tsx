import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CommentTooltip from './CommentTooltip';

describe('CommentTooltip', () => {
  it('shows loading spinner when loading', () => {
    render(<CommentTooltip loading={true} visible={true} />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('shows error and retry button', () => {
    const onRetry = vi.fn();
    render(<CommentTooltip error={'Network error'} onRetry={onRetry} visible={true} />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /retry loading comment/i });
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders string comment', () => {
    render(<CommentTooltip comment={'Hello world'} visible={true} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders localized comment from locale map', () => {
    const commentMap = { en: 'Hello', es: 'Hola', 'es-ES': 'Hola España' };
    render(<CommentTooltip comment={commentMap as any} visible={true} locale={'es'} />);
    expect(screen.getByText('Hola')).toBeInTheDocument();
  });

  it('renders object comment as JSON', () => {
    const obj = { a: 1, b: 'two' };
    render(<CommentTooltip comment={obj as any} visible={true} />);
    expect(screen.getByText(/"a": 1/)).toBeInTheDocument();
    expect(screen.getByText(/"b": "two"/)).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<CommentTooltip visible={true} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders HTML when allowHtml is true', () => {
    const html = '<strong>bold</strong> and <em>italic</em>';
    render(<CommentTooltip comment={html} visible={true} allowHtml={true} />);
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('renders localized HTML when allowHtml true and comment is locale map', () => {
    const htmlMap = { en: '<strong>bold</strong>', es: '<strong>negrita</strong>' };
    render(
      <CommentTooltip comment={htmlMap as any} visible={true} allowHtml={true} locale={'es'} />
    );
    expect(screen.getByText('negrita')).toBeInTheDocument();
  });
});
