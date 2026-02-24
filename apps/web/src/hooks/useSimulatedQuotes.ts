import type { CommodityQuote } from '@commodity-tracker/shared';
import { useEffect, useMemo, useState } from 'react';

import { createSimulatedQuote } from '../lib/simulation';

export function useSimulatedQuotes(realQuotes: CommodityQuote[]): CommodityQuote[] {
  const [quotes, setQuotes] = useState<CommodityQuote[]>([]);

  const realMap = useMemo(() => {
    return new Map(realQuotes.map((quote) => [quote.symbol, quote]));
  }, [realQuotes]);

  useEffect(() => {
    if (realQuotes.length === 0) {
      return;
    }

    setQuotes(realQuotes.map((quote) => ({ ...quote, simulated: false })));
  }, [realQuotes]);

  useEffect(() => {
    if (quotes.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setQuotes((current) =>
        current.map((quote) => {
          const real = realMap.get(quote.symbol) ?? quote;
          return createSimulatedQuote({ ...real, price: quote.price, simulated: true });
        })
      );
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [quotes.length, realMap]);

  return quotes;
}
