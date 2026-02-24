import { type ChartRange, type CommoditySymbol } from '@commodity-tracker/shared';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import type { MarketService } from '../services/marketService.js';
import type { NewsService } from '../services/newsService.js';

class FakeMarketService {
  async getSnapshot() {
    return {
      data: [
        {
          symbol: 'WTI' as CommoditySymbol,
          name: 'Crude Oil (WTI)',
          price: 80,
          previousClose: 79,
          change: 1,
          changePercent: 1.26,
          currency: 'USD',
          updatedAt: new Date().toISOString()
        }
      ],
      meta: {
        updatedAt: new Date().toISOString(),
        stale: false,
        quotaExhausted: false,
        source: 'live' as const
      }
    };
  }

  async getHistory(symbol: CommoditySymbol, range: ChartRange) {
    return {
      symbol,
      range,
      data: [
        {
          time: 1,
          open: 1,
          high: 2,
          low: 1,
          close: 2,
          volume: 100
        }
      ],
      meta: {
        updatedAt: new Date().toISOString(),
        stale: false,
        quotaExhausted: false,
        source: 'live' as const
      }
    };
  }
}

class FakeNewsService {
  async getNews(commodity: CommoditySymbol) {
    return {
      data: [
        {
          id: 'n1',
          title: 'Headline',
          source: 'Example',
          publishedAt: new Date().toISOString(),
          url: 'https://example.com',
          commodity
        }
      ],
      meta: {
        updatedAt: new Date().toISOString(),
        stale: false,
        quotaExhausted: false,
        source: 'live' as const
      }
    };
  }
}

describe('API routes', () => {
  const app = createApp({
    marketService: new FakeMarketService() as unknown as MarketService,
    newsService: new FakeNewsService() as unknown as NewsService
  });

  it('returns health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns snapshot', async () => {
    const response = await request(app).get('/api/commodities/snapshot');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('validates symbol on history endpoint', async () => {
    const response = await request(app).get('/api/commodities/bad/history?range=1M');
    expect(response.status).toBe(400);
  });

  it('returns history', async () => {
    const response = await request(app).get('/api/commodities/WTI/history?range=1M');
    expect(response.status).toBe(200);
    expect(response.body.data[0].close).toBe(2);
  });

  it('returns news', async () => {
    const response = await request(app).get('/api/news?commodity=WTI');
    expect(response.status).toBe(200);
    expect(response.body.data[0].title).toBe('Headline');
  });
});
