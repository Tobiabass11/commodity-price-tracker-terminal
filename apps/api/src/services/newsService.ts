import { type CommoditySymbol, type NewsResponse } from '@commodity-tracker/shared';

import { env } from '../config.js';
import { QuotaExceededError } from '../lib/errors.js';
import { NewsApiClient } from '../providers/newsApiClient.js';
import { MemoryCache } from './memoryCache.js';

interface NewsCacheValue {
  response: NewsResponse;
}

export class NewsService {
  private readonly cache = new MemoryCache<NewsCacheValue>();

  constructor(private readonly provider = new NewsApiClient()) {}

  async getNews(commodity: CommoditySymbol): Promise<NewsResponse> {
    const cacheKey = `news:${commodity}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached.response;
    }

    try {
      const data = await this.provider.fetchHeadlines(commodity);
      const response: NewsResponse = {
        data,
        meta: {
          updatedAt: new Date().toISOString(),
          stale: false,
          quotaExhausted: false,
          source: 'live'
        }
      };

      this.cache.set(cacheKey, { response }, env.NEWS_TTL_SECONDS);
      return response;
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        const response: NewsResponse = {
          data: [],
          meta: {
            updatedAt: new Date().toISOString(),
            stale: true,
            quotaExhausted: true,
            source: 'cache',
            message: error.message
          }
        };
        this.cache.set(cacheKey, { response }, env.NEWS_TTL_SECONDS);
        return response;
      }

      throw error;
    }
  }
}
