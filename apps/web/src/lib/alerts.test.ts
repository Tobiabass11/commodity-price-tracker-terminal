import { describe, expect, it } from 'vitest';

import { didCrossThreshold } from './alerts';

describe('didCrossThreshold', () => {
  it('detects upward crossing', () => {
    expect(didCrossThreshold(99, 101, 100, 'above')).toBe(true);
  });

  it('detects downward crossing', () => {
    expect(didCrossThreshold(102, 99, 100, 'below')).toBe(true);
  });

  it('returns false when threshold is not crossed', () => {
    expect(didCrossThreshold(101, 102, 100, 'above')).toBe(false);
  });
});
