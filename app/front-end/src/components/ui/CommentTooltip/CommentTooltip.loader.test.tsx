import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CommentTooltip from './CommentTooltip';

describe('CommentTooltip loader', () => {
  it('loads comment with loadComment function and displays it', async () => {
    const loader = vi.fn().mockResolvedValue('Loaded content');
    render(<CommentTooltip loadComment={loader} visible={true} />);
    // initially shows spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Loaded content')).toBeInTheDocument());
    expect(loader).toHaveBeenCalled();
  });

  it('shows error and allows retry when loader fails', async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network'))
      .mockResolvedValueOnce('Recovered');

    render(<CommentTooltip loadComment={loader} visible={true} />);
    // spinner then error
    await waitFor(() => expect(screen.getByText(/Network/)).toBeInTheDocument());
    const btn = screen.getByRole('button', { name: /retry loading comment/i });
    act(() => fireEvent.click(btn));
    await waitFor(() => expect(screen.getByText('Recovered')).toBeInTheDocument());
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
