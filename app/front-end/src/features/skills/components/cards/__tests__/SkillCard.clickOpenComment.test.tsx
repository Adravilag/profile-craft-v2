import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SkillCard from '../SkillCard';

// Mocks
vi.mock('@/services/endpoints/skills', () => ({
  getSkill: vi.fn(async (id: any, opts?: any) => ({ id, comment: 'Remote comment for test' })),
  updateSkill: vi.fn(),
}));

// PortalDropdown renders children directly in tests (no portal)
vi.mock('../PortalDropdown', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="portal">{children}</div>,
}));

const skill = {
  id: 's1',
  name: 'TestSkill',
  level: 42,
  featured: false,
};

const defaultProps = {
  skill,
  skillsIcons: [],
  onEdit: undefined,
  onDelete: undefined,
  onDragStart: () => {},
  onDragOver: () => {},
  onDrop: () => {},
  isDragging: false,
  isAdmin: false,
};

describe('SkillCard click to open CommentTooltip', () => {
  it('opens CommentTooltip on card click and does not show small tooltipHint', async () => {
    render(<SkillCard {...defaultProps} />);

    const article = screen.getByRole('article') || screen.getByText('TestSkill').closest('article');
    expect(article).toBeTruthy();

    await userEvent.click(article!);

    // Wait for portal tooltip to appear
    await waitFor(() => expect(screen.getByTestId('portal')).toBeInTheDocument());

    // Title of CommentTooltip contains 'Comentario de TestSkill' or 'Comment'
    expect(screen.getByText(/Comentario de TestSkill|Comment/)).toBeInTheDocument();

    // The small inline tooltip hint inside levelLabel should not be visible by default
    const smallHint = screen.queryByText('Porcentaje de dominio');
    if (smallHint) {
      // assert it's not visible
      expect(smallHint).not.toBeVisible();
    }
  });
});
