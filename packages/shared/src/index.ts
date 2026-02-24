export const COMMODITY_SYMBOLS = [
  'WTI',
  'BRENT',
  'NATURAL_GAS',
  'GOLD',
  'SILVER',
  'COPPER',
  'WHEAT',
] as const;

export type CommoditySymbol = (typeof COMMODITY_SYMBOLS)[number];

export const COMMODITY_LABELS: Record<CommoditySymbol, string> = {
  WTI: 'Crude Oil (WTI)',
  BRENT: 'Crude Oil (Brent)',
  NATURAL_GAS: 'Natural Gas',
  GOLD: 'Gold',
  SILVER: 'Silver',
  COPPER: 'Copper',
  WHEAT: 'Wheat',
};

export const CHART_RANGES = ['1D', '5D', '1M', '3M', '1Y'] as const;

export type ChartRange = (typeof CHART_RANGES)[number];

export interface CommodityQuote {
  symbol: CommoditySymbol;
  name: string;
  price: number;
  currency: string;
  previousClose: number;
  change: number;
  changePercent: number;
  updatedAt: string;
  simulated?: boolean;
}

export interface CandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsHeadline {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  commodity: CommoditySymbol;
}

export interface ApiMeta {
  updatedAt: string;
  stale: boolean;
  quotaExhausted: boolean;
  source: 'live' | 'cache';
  message?: string;
}

export interface SnapshotResponse {
  data: CommodityQuote[];
  meta: ApiMeta;
}

export interface HistoryResponse {
  symbol: CommoditySymbol;
  range: ChartRange;
  data: CandlePoint[];
  meta: ApiMeta;
}

export interface NewsResponse {
  data: NewsHeadline[];
  meta: ApiMeta;
}

export type AlertDirection = 'above' | 'below';

export interface AlertRule {
  symbol: CommoditySymbol;
  direction: AlertDirection;
  threshold: number;
  enabled: boolean;
}
