import type { AlertDirection } from '@commodity-tracker/shared';

export function didCrossThreshold(
  previousPrice: number,
  currentPrice: number,
  threshold: number,
  direction: AlertDirection
): boolean {
  if (direction === 'above') {
    return previousPrice < threshold && currentPrice >= threshold;
  }

  return previousPrice > threshold && currentPrice <= threshold;
}
