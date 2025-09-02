// [TEST]
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from './Card';

describe('Card', () => {
  it('should render basic card with children', () => {
    render(
      <Card>
        <h2>Test Content</h2>
      </Card>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render card with header section', () => {
    render(
      <Card>
        <Card.Header>
          <h2>Header Content</h2>
        </Card.Header>
        <Card.Body>
          <p>Body Content</p>
        </Card.Body>
      </Card>
    );

    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('should render card with media, header, body and footer', () => {
    render(
      <Card>
        <Card.Media>
          <img src="test.jpg" alt="Test Image" />
        </Card.Media>
        <Card.Header>
          <h2>Card Title</h2>
          <span>Subtitle</span>
        </Card.Header>
        <Card.Body>
          <p>Card description</p>
        </Card.Body>
        <Card.Footer>
          <button>Action</button>
        </Card.Footer>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByAltText('Test Image')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <Card className="custom-card">
        <p>Test</p>
      </Card>
    );

    const card = screen.getByText('Test').closest('div');
    expect(card).toHaveClass('custom-card');
  });

  it('should handle card with tags section', () => {
    render(
      <Card>
        <Card.Header>
          <h2>Technology Card</h2>
        </Card.Header>
        <Card.Body>
          <p>Description</p>
        </Card.Body>
        <Card.Tags>
          <span>React</span>
          <span>TypeScript</span>
        </Card.Tags>
      </Card>
    );

    expect(screen.getByText('Technology Card')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});
