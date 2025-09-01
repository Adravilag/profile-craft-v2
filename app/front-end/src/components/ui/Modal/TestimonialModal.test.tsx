import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TestimonialModal from './TestimonialModal';

// Mock createPortal para evitar problemas en los tests
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

describe('TestimonialModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    // Limpiar cualquier modificación del DOM después de cada test
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.documentElement.style.overflow = '';
  });

  it('should render modal when isOpen is true', () => {
    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(
      <TestimonialModal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('should call onClose when clicking overlay', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    const overlay = screen.getByRole('dialog');
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when pressing Escape key', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking close button', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    const closeButton = screen.getByLabelText('Cerrar modal');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking inside modal content', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    const content = screen.getByText('Modal Content');
    await user.click(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should block body scroll when modal is open', () => {
    const { rerender } = render(
      <TestimonialModal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    // Modal cerrado - body debe tener scroll normal
    expect(document.body.style.overflow).toBe('');

    // Abrir modal
    rerender(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    // Modal abierto - body debe tener scroll bloqueado
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
  });

  it('should restore body scroll when modal is closed', () => {
    const { rerender } = render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    // Modal abierto - body debe tener scroll bloqueado
    expect(document.body.style.overflow).toBe('hidden');

    // Cerrar modal
    rerender(
      <TestimonialModal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    // Modal cerrado - body debe tener scroll restaurado
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
  });

  it('should handle focus management properly', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <input data-testid="input1" placeholder="First input" />
        <textarea data-testid="textarea1" placeholder="Textarea" />
        <input data-testid="input2" placeholder="Second input" />
      </TestimonialModal>
    );

    const input1 = screen.getByTestId('input1');
    const textarea = screen.getByTestId('textarea1');
    const input2 = screen.getByTestId('input2');

    // Con auto-focus deshabilitado, enfocar manualmente el primer input
    await user.click(input1);
    expect(input1).toHaveFocus();

    // Navegar con Tab
    await user.tab();
    expect(textarea).toHaveFocus();

    await user.tab();
    expect(input2).toHaveFocus();

    // Navegar hacia atrás con Shift+Tab
    await user.tab({ shift: true });
    expect(textarea).toHaveFocus();
  });

  it('should not interfere with typing in inputs', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <input data-testid="name-input" placeholder="Name" />
        <textarea data-testid="testimony-textarea" placeholder="Testimony" />
      </TestimonialModal>
    );

    const nameInput = screen.getByTestId('name-input');
    const testimonyTextarea = screen.getByTestId('testimony-textarea');

    // Escribir en el input de nombre
    await user.click(nameInput);
    await user.type(nameInput, 'John Doe');

    // Verificar que el foco permanece en el input de nombre
    expect(nameInput).toHaveFocus();
    expect(nameInput).toHaveValue('John Doe');

    // Moverse al textarea y escribir
    await user.click(testimonyTextarea);
    await user.type(testimonyTextarea, 'This is a great testimony about the work.');

    // Verificar que el foco permanece en el textarea
    expect(testimonyTextarea).toHaveFocus();
    expect(testimonyTextarea).toHaveValue('This is a great testimony about the work.');

    // Verificar que el valor del input anterior no cambió
    expect(nameInput).toHaveValue('John Doe');
  });

  it('should allow arrow keys and other navigation keys in inputs', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <input data-testid="test-input" defaultValue="Test text" />
      </TestimonialModal>
    );

    const input = screen.getByTestId('test-input');
    await user.click(input);

    // Posicionar cursor al final
    await user.keyboard('{End}');

    // Mover cursor hacia atrás y insertar texto
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    await user.type(input, 'New ');

    // El input debería permitir la navegación normal
    expect(input).toHaveValue('Test New text');
  });

  it('should handle multiple focus changes without auto-focusing repeatedly', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <input data-testid="input1" placeholder="First input" />
        <input data-testid="input2" placeholder="Second input" />
        <textarea data-testid="textarea" placeholder="Textarea" />
      </TestimonialModal>
    );

    const input1 = screen.getByTestId('input1');
    const input2 = screen.getByTestId('input2');
    const textarea = screen.getByTestId('textarea');

    // Con auto-focus deshabilitado, enfocar manualmente
    await user.click(input1);
    expect(input1).toHaveFocus();

    // Cambiar foco manualmente múltiples veces
    await user.click(input2);
    expect(input2).toHaveFocus();

    await user.click(textarea);
    expect(textarea).toHaveFocus();

    await user.click(input1);
    expect(input1).toHaveFocus();

    // Escribir algo para verificar que el foco no cambia automáticamente
    await user.type(input1, 'Test content');
    expect(input1).toHaveFocus();
    expect(input1).toHaveValue('Test content');
  });
});
