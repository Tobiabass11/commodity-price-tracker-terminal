import { COMMODITY_SYMBOLS } from '@commodity-tracker/shared';
import { Router } from 'express';

import type { NewsService } from '../services/newsService.js';

export function createNewsRoutes(newsService: NewsService): Router {
  const router = Router();

  router.get('/', async (request, response, next) => {
    try {
      const symbol = String(request.query.commodity ?? 'WTI').toUpperCase();

      if (!COMMODITY_SYMBOLS.includes(symbol as (typeof COMMODITY_SYMBOLS)[number])) {
        response.status(400).json({ error: 'Unsupported commodity symbol' });
        return;
      }

      const result = await newsService.getNews(symbol as (typeof COMMODITY_SYMBOLS)[number]);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
