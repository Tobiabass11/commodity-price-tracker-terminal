import { type CommoditySymbol, type NewsHeadline } from '@commodity-tracker/shared';

import { env } from '../config.js';
import { ProviderError, QuotaExceededError } from '../lib/errors.js';
import { fetchJson } from '../lib/http.js';

const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything';

const QUERY_BY_SYMBOL: Record<CommoditySymbol, string> = {
  WTI: 'WTI crude oil OR West Texas Intermediate',
  BRENT: 'Brent crude',
  NATURAL_GAS: 'natural gas prices',
  GOLD: 'gold commodity prices',
  SILVER: 'silver commodity prices',
  COPPER: 'copper commodity prices',
  WHEAT: 'wheat commodity prices'
};

interface NewsApiPayload {
  status: 'ok' | 'error';
  code?: string;
  message?: string;
  articles?: Array<{
    title: string;
    url: string;
    publishedAt: string;
    source: {
      name: string;
    };
  }>;
}

export class NewsApiClient {
  async fetchHeadlines(commodity: CommoditySymbol): Promise<NewsHeadline[]> {
    const query = QUERY_BY_SYMBOL[commodity];
    const url = new URL(NEWS_API_BASE_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', '15');
    url.searchParams.set('apiKey', env.NEWS_API_KEY);

    const payload = await fetchJson<NewsApiPayload>(url.toString(), env.REQUEST_TIMEOUT_MS);

    if (payload.status === 'error') {
      if (payload.code === 'rateLimited') {
        throw new QuotaExceededError(payload.message ?? 'News quota exhausted');
      }
      throw new ProviderError(payload.message ?? 'News provider failed');
    }

    return (payload.articles ?? []).map((item) => ({
      id: `${commodity}-${item.url}`,
      title: item.title,
      source: item.source.name,
      publishedAt: item.publishedAt,
      url: item.url,
      commodity
    }));
  }
}
