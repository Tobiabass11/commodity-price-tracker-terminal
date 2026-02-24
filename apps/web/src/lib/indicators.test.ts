import { describe, expect, it } from 'vitest';

import { calculateMovingAverage } from './indicators';

describe('calculateMovingAverage', () => {
  it('computes moving average for provided period', () => {
    const data = [
      { time: 1, open: 1, high: 1, low: 1, close: 1, volume: 10 },
      { time: 2, open: 2, high: 2, low: 2, close: 2, volume: 10 },
      { time: 3, open: 3, high: 3, low: 3, close: 3, volume: 10 }
    ];

    const result = calculateMovingAverage(data, 2);

    expect(result).toEqual([
      { time: 2, value: 1.5 },
      { time: 3, value: 2.5 }
    ]);
  });

  it('returns empty for invalid period', () => {
    expect(calculateMovingAverage([], 5)).toEqual([]);
  });
});
