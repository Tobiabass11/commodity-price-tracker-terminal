import type { CommodityQuote, CommoditySymbol } from '@commodity-tracker/shared';

import { CommodityCard } from './CommodityCard';

interface SparklinePoint {
  time: number;
  price: number;
}

interface CommodityGridProps {
  quotes: CommodityQuote[];
  selectedSymbol: CommoditySymbol;
  highlightedSymbol?: CommoditySymbol;
  watchlist: CommoditySymbol[];
  sparklineData: Partial<Record<CommoditySymbol, SparklinePoint[]>>;
  onSelect: (symbol: CommoditySymbol) => void;
  onToggleWatchlist: (symbol: CommoditySymbol) => void;
}

export function CommodityGrid({
  quotes,
  selectedSymbol,
  highlightedSymbol,
  watchlist,
  sparklineData,
  onSelect,
  onToggleWatchlist
}: CommodityGridProps) {
  const ordered = [...quotes].sort((a, b) => {
    const aWatch = watchlist.includes(a.symbol);
    const bWatch = watchlist.includes(b.symbol);
    if (aWatch === bWatch) {
      return a.name.localeCompare(b.name);
    }
    return aWatch ? -1 : 1;
  });

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      {ordered.map((quote) => (
        <CommodityCard
          key={quote.symbol}
          quote={quote}
          selected={quote.symbol === selectedSymbol}
          highlighted={quote.symbol === highlightedSymbol}
          inWatchlist={watchlist.includes(quote.symbol)}
          sparkline={
            sparklineData[quote.symbol] ?? [
              {
                time: Date.now(),
                price: quote.price
              }
            ]
          }
          onSelect={onSelect}
          onToggleWatchlist={onToggleWatchlist}
        />
      ))}
    </div>
  );
}
