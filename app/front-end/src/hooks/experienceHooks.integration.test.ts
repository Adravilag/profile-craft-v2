import { describe, it, expect } from 'vitest';
import { useExperience } from './useExperience';
import { useEducation } from './useEducation';
import { useExperienceSection } from './useExperienceSection';

describe('Hooks Integration Test', () => {
  it('should export all experience hooks properly', () => {
    expect(typeof useExperience).toBe('function');
    expect(typeof useEducation).toBe('function');
    expect(typeof useExperienceSection).toBe('function');
  });
});
