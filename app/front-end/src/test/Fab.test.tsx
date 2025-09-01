import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingActionButtonGroup from '../ui/components/FloatingActionButtonGroup';
import type { FABAction } from '../ui/components/FloatingActionButtonGroup';

describe('FloatingActionButtonGroup', () => {
  test('renders actions and responds to click', () => {
    const clicked: string[] = [];
    const actions: FABAction[] = [
      {
        id: 'a1',
        onClick: () => clicked.push('a1'),
        icon: 'fas fa-plus',
        label: 'Add',
        color: 'success',
      },
      {
        id: 'a2',
        onClick: () => clicked.push('a2'),
        icon: 'fas fa-edit',
        label: 'Edit',
        color: 'primary',
      },
    ];

    render(<FloatingActionButtonGroup actions={actions} position="bottom-right" />);

    const btnA1 = screen.getByLabelText('Add');
    const btnA2 = screen.getByLabelText('Edit');

    expect(btnA1).toBeInTheDocument();
    expect(btnA2).toBeInTheDocument();

    fireEvent.click(btnA1);
    fireEvent.click(btnA2);

    expect(clicked).toEqual(['a1', 'a2']);
  });
});
