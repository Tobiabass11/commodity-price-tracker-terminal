import type { CandlePoint } from '@commodity-tracker/shared';

export interface MovingAveragePoint {
  time: number;
  value: number;
}

export function calculateMovingAverage(data: CandlePoint[], period: number): MovingAveragePoint[] {
  if (period <= 0 || data.length < period) {
    return [];
  }

  const points: MovingAveragePoint[] = [];

  for (let index = period - 1; index < data.length; index += 1) {
    const slice = data.slice(index - period + 1, index + 1);
    const sum = slice.reduce((acc, item) => acc + item.close, 0);
    points.push({
      time: data[index].time,
      value: sum / period
    });
  }

  return points;
}
