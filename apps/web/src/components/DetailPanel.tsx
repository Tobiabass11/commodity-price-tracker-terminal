import { CHART_RANGES, type CandlePoint, type ChartRange, type CommodityQuote } from '@commodity-tracker/shared';
import clsx from 'clsx';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState } from 'react';

import { formatDateTime, formatPrice } from '../lib/format';
import { CandlestickChart } from './CandlestickChart';

interface DetailPanelProps {
  quote?: CommodityQuote;
  data: CandlePoint[];
  selectedRange: ChartRange;
  onRangeChange: (range: ChartRange) => void;
  loading: boolean;
}

export function DetailPanel({ quote, data, selectedRange, onRangeChange, loading }: DetailPanelProps) {
  const [showMa20, setShowMa20] = useState(true);
  const [showMa50, setShowMa50] = useState(false);

  return (
    <section className="rounded-xl border border-terminal-border bg-terminal-panel p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-terminal-muted">Detailed View</p>
          <h2 className="text-lg font-semibold text-terminal-text">{quote?.name ?? 'Select a commodity'}</h2>
          {quote ? (
            <p className="font-mono text-sm text-terminal-muted">
              {formatPrice(quote.price)} updated {formatDateTime(quote.updatedAt)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {CHART_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onRangeChange(range)}
              className={clsx(
                'rounded-md border px-2 py-1 text-xs font-semibold transition-colors',
                range === selectedRange
                  ? 'border-cyan-400/70 bg-cyan-500/15 text-cyan-300'
                  : 'border-terminal-border text-terminal-muted hover:text-terminal-text'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-terminal-muted">
          <input type="checkbox" checked={showMa20} onChange={(event) => setShowMa20(event.target.checked)} />
          MA20
        </label>
        <label className="flex items-center gap-2 text-xs text-terminal-muted">
          <input type="checkbox" checked={showMa50} onChange={(event) => setShowMa50(event.target.checked)} />
          MA50
        </label>
        {quote?.simulated ? (
          <span className="rounded bg-cyan-500/20 px-2 py-1 text-[11px] font-semibold uppercase text-cyan-300">
            Simulated Tick Stream
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="grid h-[380px] place-items-center text-terminal-muted">Loading chart data...</div>
      ) : (
        <>
          <CandlestickChart data={data} showMa20={showMa20} showMa50={showMa50} />
          <div className="mt-4 h-40 rounded border border-terminal-border/70 bg-[#101926] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => value.toLocaleString('en-US')}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937' }}
                />
                <Bar dataKey="volume" fill="#38bdf8" opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
