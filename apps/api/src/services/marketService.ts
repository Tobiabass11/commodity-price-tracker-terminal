import {
  COMMODITY_LABELS,
  COMMODITY_SYMBOLS,
  type ApiMeta,
  type CandlePoint,
  type ChartRange,
  type CommodityQuote,
  type CommoditySymbol,
  type HistoryResponse,
  type SnapshotResponse
} from '@commodity-tracker/shared';

import { env } from '../config.js';
import { QuotaExceededError } from '../lib/errors.js';
import { AlphaVantageClient } from '../providers/alphaVantageClient.js';
import { MemoryCache } from './memoryCache.js';

const SEED_PRICES: Record<CommoditySymbol, number> = {
  WTI: 78.2,
  BRENT: 81.1,
  NATURAL_GAS: 2.2,
  GOLD: 2034,
  SILVER: 23.2,
  COPPER: 4.1,
  WHEAT: 5.8
};

interface SnapshotCacheValue {
  response: SnapshotResponse;
}

interface HistoryCacheValue {
  response: HistoryResponse;
}

export class MarketService {
  private readonly snapshotCache = new MemoryCache<SnapshotCacheValue>();
  private readonly historyCache = new MemoryCache<HistoryCacheValue>();
  private readonly lastGoodQuotes = new Map<CommoditySymbol, CommodityQuote>(
    COMMODITY_SYMBOLS.map((symbol) => {
      const price = SEED_PRICES[symbol];
      return [
        symbol,
        {
          symbol,
          name: COMMODITY_LABELS[symbol],
          price,
          previousClose: price * 0.998,
          change: price * 0.002,
          changePercent: 0.2,
          currency: 'USD',
          updatedAt: new Date().toISOString()
        }
      ];
    })
  );

  constructor(private readonly provider = new AlphaVantageClient()) {}

  async getSnapshot(): Promise<SnapshotResponse> {
    const cached = this.snapshotCache.get('snapshot');
    if (cached) {
      return cached.response;
    }

    let quotaExhausted = false;
    let message: string | undefined;
    let successCount = 0;

    for (const symbol of COMMODITY_SYMBOLS) {
      try {
        const quote = await this.provider.fetchQuote(symbol);
        this.lastGoodQuotes.set(symbol, quote);
        successCount += 1;
      } catch (error) {
        if (error instanceof QuotaExceededError) {
          quotaExhausted = true;
          message = error.message;
          break;
        }
      }
    }

    const data = COMMODITY_SYMBOLS.map((symbol) => this.lastGoodQuotes.get(symbol)).filter(
      (item): item is CommodityQuote => Boolean(item)
    );

    const meta: ApiMeta = {
      updatedAt: new Date().toISOString(),
      stale: quotaExhausted || successCount < COMMODITY_SYMBOLS.length,
      quotaExhausted,
      source: successCount > 0 ? 'live' : 'cache',
      message
    };

    const response: SnapshotResponse = { data, meta };

    this.snapshotCache.set('snapshot', { response }, env.SNAPSHOT_TTL_SECONDS);
    return response;
  }

  async getHistory(symbol: CommoditySymbol, range: ChartRange): Promise<HistoryResponse> {
    const cacheKey = `${symbol}:${range}`;
    const cached = this.historyCache.get(cacheKey);
    if (cached) {
      return cached.response;
    }

    try {
      const data = await this.provider.fetchHistory(symbol, range);
      const response: HistoryResponse = {
        symbol,
        range,
        data,
        meta: {
          updatedAt: new Date().toISOString(),
          stale: false,
          quotaExhausted: false,
          source: 'live'
        }
      };

      this.historyCache.set(cacheKey, { response }, env.HISTORY_TTL_SECONDS);
      return response;
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        const fallbackData = this.buildFallbackHistory(symbol);
        const response: HistoryResponse = {
          symbol,
          range,
          data: fallbackData,
          meta: {
            updatedAt: new Date().toISOString(),
            stale: true,
            quotaExhausted: true,
            source: 'cache',
            message: error.message
          }
        };

        this.historyCache.set(cacheKey, { response }, env.HISTORY_TTL_SECONDS);
        return response;
      }

      throw error;
    }
  }

  private buildFallbackHistory(symbol: CommoditySymbol): CandlePoint[] {
    const quote = this.lastGoodQuotes.get(symbol);
    const basePrice = quote?.price ?? SEED_PRICES[symbol];

    return Array.from({ length: 60 }, (_, index) => {
      const drift = Math.sin(index / 8) * basePrice * 0.01;
      const close = basePrice + drift;
      const open = close * (1 + Math.sin(index / 4) * 0.002);
      const high = Math.max(open, close) * 1.003;
      const low = Math.min(open, close) * 0.997;

      return {
        time: Math.floor((Date.now() - (60 - index) * 24 * 60 * 60 * 1000) / 1000),
        open,
        high,
        low,
        close,
        volume: 100000 + index * 500
      } satisfies CandlePoint;
    });
  }
}
