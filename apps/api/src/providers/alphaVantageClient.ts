import {
  CHART_RANGES,
  COMMODITY_LABELS,
  type CandlePoint,
  type ChartRange,
  type CommodityQuote,
  type CommoditySymbol
} from '@commodity-tracker/shared';

import { env } from '../config.js';
import { fetchJson } from '../lib/http.js';

const ALPHA_BASE_URL = 'https://www.alphavantage.co/query';

const ETF_TICKER_BY_SYMBOL: Record<CommoditySymbol, string> = {
  WTI: 'USO',
  BRENT: 'BNO',
  NATURAL_GAS: 'UNG',
  GOLD: 'GLD',
  SILVER: 'SLV',
  COPPER: 'CPER',
  WHEAT: 'WEAT'
};

const DAYS_BY_RANGE: Record<ChartRange, number> = {
  '1D': 2,
  '5D': 7,
  '1M': 35,
  '3M': 100,
  '1Y': 370
};

interface TimeSeriesRow {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume'?: string;
}

interface AlphaTimeSeriesResponse {
  'Time Series (Daily)'?: Record<string, TimeSeriesRow>;
}

export class AlphaVantageClient {
  async fetchFullSeries(symbol: CommoditySymbol): Promise<CandlePoint[]> {
    const ticker = ETF_TICKER_BY_SYMBOL[symbol];
    const url = new URL(ALPHA_BASE_URL);
    url.searchParams.set('function', 'TIME_SERIES_DAILY');
    url.searchParams.set('symbol', ticker);
    url.searchParams.set('outputsize', 'full');
    url.searchParams.set('apikey', env.ALPHA_VANTAGE_API_KEY);

    const payload = await fetchJson<AlphaTimeSeriesResponse>(url.toString(), env.REQUEST_TIMEOUT_MS);
    const rawSeries = payload['Time Series (Daily)'];

    if (!rawSeries || Object.keys(rawSeries).length === 0) {
      throw new Error(`No daily series returned for ${symbol}`);
    }

    const points = Object.entries(rawSeries)
      .map(([date, row]) => {
        const open = Number(row['1. open']);
        const high = Number(row['2. high']);
        const low = Number(row['3. low']);
        const close = Number(row['4. close']);
        const volume = Number(row['5. volume'] ?? '0');

        return {
          time: Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000),
          open,
          high,
          low,
          close,
          volume
        } satisfies CandlePoint;
      })
      .sort((a, b) => a.time - b.time);

    return points;
  }

  async fetchHistory(symbol: CommoditySymbol, range: ChartRange): Promise<CandlePoint[]> {
    if (!CHART_RANGES.includes(range)) {
      throw new Error(`Unsupported range: ${range}`);
    }

    const points = await this.fetchFullSeries(symbol);
    const days = DAYS_BY_RANGE[range];
    return points.slice(-days);
  }

  async fetchQuote(symbol: CommoditySymbol): Promise<CommodityQuote> {
    const points = await this.fetchFullSeries(symbol);

    const latest = points.at(-1);
    const previous = points.at(-2);

    if (!latest || !previous) {
      throw new Error(`Not enough data to compute quote for ${symbol}`);
    }

    const change = latest.close - previous.close;
    const changePercent = previous.close === 0 ? 0 : (change / previous.close) * 100;

    return {
      symbol,
      name: COMMODITY_LABELS[symbol],
      price: latest.close,
      previousClose: previous.close,
      change,
      changePercent,
      currency: 'USD',
      updatedAt: new Date(latest.time * 1000).toISOString()
    };
  }
}
