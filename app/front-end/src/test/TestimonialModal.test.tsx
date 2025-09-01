import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestimonialModal from '../components/ui/Modal/TestimonialModal';
import '@testing-library/jest-dom';

describe('TestimonialModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  const TestForm = () => {
    const [form, setForm] = React.useState({
      name: '',
      position: '',
      text: '',
      email: '',
      company: '',
      website: '',
      rating: 5,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
      <form>
        <div>
          <label htmlFor="name">Nombre *</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            required
            data-testid="name-input"
          />
        </div>

        <div>
          <label htmlFor="position">Puesto *</label>
          <input
            id="position"
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="Tu puesto de trabajo"
            required
            data-testid="position-input"
          />
        </div>

        <div>
          <label htmlFor="text">Testimonio *</label>
          <textarea
            id="text"
            name="text"
            value={form.text}
            onChange={handleChange}
            placeholder="Comparte tu experiencia trabajando conmigo..."
            required
            rows={4}
            data-testid="text-textarea"
          />
        </div>
      </form>
    );
  };

  test('should render modal when open', () => {
    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  test('should not render modal when closed', () => {
    render(
      <TestimonialModal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should close modal when pressing Escape', async () => {
    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should close modal when clicking overlay', async () => {
    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should close modal when clicking close button', async () => {
    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </TestimonialModal>
    );

    const closeButton = screen.getByLabelText('Cerrar modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should focus first input on open', async () => {
    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <TestForm />
      </TestimonialModal>
    );

    await waitFor(
      () => {
        const nameInput = screen.getByTestId('name-input');
        expect(nameInput).toHaveFocus();
      },
      { timeout: 200 }
    );
  });

  test('should maintain focus when typing in name input', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <TestForm />
      </TestimonialModal>
    );

    const nameInput = screen.getByTestId('name-input');

    // Wait for auto-focus
    await waitFor(
      () => {
        expect(nameInput).toHaveFocus();
      },
      { timeout: 200 }
    );

    // Type in the name input
    await user.type(nameInput, 'Juan Pérez');

    // Focus should remain on name input
    expect(nameInput).toHaveFocus();
    expect(nameInput).toHaveValue('Juan Pérez');
  });

  test('should maintain focus when typing in position input', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <TestForm />
      </TestimonialModal>
    );

    const positionInput = screen.getByTestId('position-input');

    // Click on position input to focus it
    await user.click(positionInput);

    // Type in the position input
    await user.type(positionInput, 'Desarrollador Frontend');

    // Focus should remain on position input
    expect(positionInput).toHaveFocus();
    expect(positionInput).toHaveValue('Desarrollador Frontend');
  });

  test('should maintain focus when typing in textarea', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <TestForm />
      </TestimonialModal>
    );

    const textTextarea = screen.getByTestId('text-textarea');

    // Click on textarea to focus it
    await user.click(textTextarea);

    // Type in the textarea
    await user.type(
      textTextarea,
      'Este es un testimonio de prueba que debería mantener el foco en el textarea mientras escribo.'
    );

    // Focus should remain on textarea
    expect(textTextarea).toHaveFocus();
    expect(textTextarea).toHaveValue(
      'Este es un testimonio de prueba que debería mantener el foco en el textarea mientras escribo.'
    );
  });

  test('should not interfere with tab navigation between inputs', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <TestForm />
      </TestimonialModal>
    );

    const nameInput = screen.getByTestId('name-input');
    const positionInput = screen.getByTestId('position-input');
    const textTextarea = screen.getByTestId('text-textarea');

    // Wait for auto-focus on name input
    await waitFor(
      () => {
        expect(nameInput).toHaveFocus();
      },
      { timeout: 200 }
    );

    // Tab to position input
    await user.tab();
    expect(positionInput).toHaveFocus();

    // Tab to textarea
    await user.tab();
    expect(textTextarea).toHaveFocus();
  });

  test('should allow arrow key navigation within inputs', async () => {
    const user = userEvent.setup();

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <TestForm />
      </TestimonialModal>
    );

    const nameInput = screen.getByTestId('name-input');

    // Wait for auto-focus
    await waitFor(
      () => {
        expect(nameInput).toHaveFocus();
      },
      { timeout: 200 }
    );

    // Type some text
    await user.type(nameInput, 'Juan Pérez');

    // Use arrow keys to navigate within the input
    await user.keyboard('{ArrowLeft}{ArrowLeft}');

    // Focus should remain on name input
    expect(nameInput).toHaveFocus();
  });

  test('should not trigger auto-focus multiple times', async () => {
    const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');

    render(
      <TestimonialModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <TestForm />
      </TestimonialModal>
    );

    // Wait for initial auto-focus
    await waitFor(
      () => {
        const nameInput = screen.getByTestId('name-input');
        expect(nameInput).toHaveFocus();
      },
      { timeout: 200 }
    );

    // Reset the spy to count only additional focus calls
    focusSpy.mockClear();

    // Simulate some user interaction
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    // Wait a bit to ensure no additional focus calls
    await new Promise(resolve => setTimeout(resolve, 200));

    // No additional focus calls should have been made
    expect(focusSpy).not.toHaveBeenCalled();

    focusSpy.mockRestore();
  });
});
