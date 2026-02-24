import type { CandlePoint } from '@commodity-tracker/shared';
import { createChart, type CandlestickData, ColorType, type LineData, type Time } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

import { calculateMovingAverage } from '../lib/indicators';

interface CandlestickChartProps {
  data: CandlePoint[];
  showMa20: boolean;
  showMa50: boolean;
}

export function CandlestickChart({ data, showMa20, showMa50 }: CandlestickChartProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) {
      return;
    }

    const chart = createChart(ref.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: '#0f1624'
        },
        textColor: '#b7c0cd'
      },
      width: ref.current.clientWidth,
      height: 380,
      grid: {
        vertLines: { color: '#1b2636' },
        horzLines: { color: '#1b2636' }
      },
      rightPriceScale: {
        borderColor: '#263246'
      },
      timeScale: {
        borderColor: '#263246'
      }
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444'
    });

    const candles: CandlestickData[] = data.map((item) => ({
      time: item.time as Time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close
    }));

    candlestickSeries.setData(candles);

    if (showMa20) {
      const ma20Series = chart.addLineSeries({ color: '#f59e0b', lineWidth: 2 });
      const ma20Data: LineData[] = calculateMovingAverage(data, 20).map((item) => ({
        time: item.time as Time,
        value: item.value
      }));
      ma20Series.setData(ma20Data);
    }

    if (showMa50) {
      const ma50Series = chart.addLineSeries({ color: '#60a5fa', lineWidth: 2 });
      const ma50Data: LineData[] = calculateMovingAverage(data, 50).map((item) => ({
        time: item.time as Time,
        value: item.value
      }));
      ma50Series.setData(ma50Data);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (!ref.current) {
        return;
      }
      chart.applyOptions({ width: ref.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, showMa20, showMa50]);

  return <div className="w-full" ref={ref} />;
}
