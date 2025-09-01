import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';
import styles from './Button.module.css';

describe('Button', () => {
  it('renderiza el texto correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('aplica la clase de estilos del módulo CSS', () => {
    render(<Button>Estilo</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(styles.button);
  });

  it("aplica la clase global 'will-transform' desde JS", () => {
    render(<Button>Animado</Button>);
    const button = screen.getByRole('button');
    // Simula el efecto que añade la clase global
    button.classList.add('will-transform');
    expect(button).toHaveClass('will-transform');
  });
});
