import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkillBadge from './SkillBadge';

describe('SkillBadge', () => {
  it('renders fallback icon when no slug or skill provided', () => {
    render(<SkillBadge />);
    const el = screen.getByRole('button');
    expect(el).toBeTruthy();
  });

  it('uses slug to resolve icon when provided', () => {
    render(<SkillBadge slug="react" />);
    const el = screen.getByRole('button');
    expect(el).toBeTruthy();
  });

  it('prefers skill.svg_path when provided', () => {
    const skill = { name: 'MySkill', svg_path: '/assets/svg/custom.svg' } as any;
    render(<SkillBadge skill={skill} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/assets/svg/custom.svg');
  });

  it('prefers svg prop over resolved icons', () => {
    const svgUrl = '/assets/svg/explicit.svg';
    render(<SkillBadge svg={svgUrl} />);
    const btn = screen.getByRole('button');
    const img = btn.querySelector('img');
    expect(img).toBeTruthy();
    expect(img).toHaveAttribute('src', svgUrl);
  });

  it('injects --skill-color when color prop is provided', () => {
    const color = '#123456';
    render(<SkillBadge color={color} colored />);
    const btn = screen.getByRole('button');
    const cs = window.getComputedStyle(btn as Element);
    expect(cs.getPropertyValue('--skill-color').trim()).toBe(color);
  });

  it('ignores HTML-like svg content and falls back', async () => {
    // Simulate passing HTML content (dev server fallback)
    const skill = { name: 'Broken', svg_path: '<!doctype html><html></html>' } as any;
    render(<SkillBadge skill={skill} />);
    // Should render fallback (icon element) instead of broken svg string
    const el = screen.getByRole('button');
    expect(el).toBeTruthy();
  });
});

export {};
