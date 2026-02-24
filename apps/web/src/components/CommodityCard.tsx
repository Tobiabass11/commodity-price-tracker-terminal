import type { CommodityQuote, CommoditySymbol } from '@commodity-tracker/shared';
import clsx from 'clsx';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

import { formatChange, formatPercent, formatPrice } from '../lib/format';

interface SparklinePoint {
  time: number;
  price: number;
}

interface CommodityCardProps {
  quote: CommodityQuote;
  selected: boolean;
  highlighted: boolean;
  inWatchlist: boolean;
  sparkline: SparklinePoint[];
  onSelect: (symbol: CommoditySymbol) => void;
  onToggleWatchlist: (symbol: CommoditySymbol) => void;
}

export function CommodityCard({
  quote,
  selected,
  highlighted,
  inWatchlist,
  sparkline,
  onSelect,
  onToggleWatchlist
}: CommodityCardProps) {
  const gain = quote.change >= 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(quote.symbol)}
      className={clsx(
        'group relative w-full rounded-lg border p-3 text-left transition-all duration-150',
        selected ? 'border-cyan-400/70 bg-terminal-card shadow-md shadow-cyan-500/10' : 'border-terminal-border bg-terminal-card',
        highlighted && 'animate-pulse border-terminal-amber shadow-md shadow-terminal-amber/20'
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-terminal-muted">{quote.symbol.replace('_', ' ')}</p>
          <h3 className="text-sm font-medium text-terminal-text">{quote.name}</h3>
        </div>

        <div className="flex items-center gap-1">
          {quote.simulated ? (
            <span className="rounded bg-cyan-500/20 px-2 py-1 text-[10px] font-semibold uppercase text-cyan-300">
              Simulated
            </span>
          ) : null}

          <button
            type="button"
            className={clsx(
              'rounded px-2 py-1 text-[10px] font-semibold uppercase transition-colors',
              inWatchlist
                ? 'bg-terminal-amber/25 text-terminal-amber'
                : 'bg-terminal-border/70 text-terminal-muted hover:text-terminal-text'
            )}
            onClick={(event) => {
              event.stopPropagation();
              onToggleWatchlist(quote.symbol);
            }}
          >
            {inWatchlist ? 'Watching' : 'Watch'}
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xl font-semibold text-terminal-text">{formatPrice(quote.price)}</p>
          <p className={clsx('font-mono text-sm', gain ? 'text-terminal-gain' : 'text-terminal-loss')}>
            {formatChange(quote.change)} ({formatPercent(quote.changePercent)})
          </p>
        </div>

        <div className="h-16 w-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline}>
              <Tooltip
                formatter={(value: number) => formatPrice(value)}
                labelStyle={{ color: '#e5ecf3' }}
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                dot={false}
                strokeWidth={2}
                stroke={gain ? '#2ecc71' : '#ef4444'}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </button>
  );
}
