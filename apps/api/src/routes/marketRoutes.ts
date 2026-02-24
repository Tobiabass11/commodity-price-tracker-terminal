import { CHART_RANGES, COMMODITY_SYMBOLS } from '@commodity-tracker/shared';
import { Router } from 'express';

import type { MarketService } from '../services/marketService.js';

export function createMarketRoutes(marketService: MarketService): Router {
  const router = Router();

  router.get('/snapshot', async (_request, response, next) => {
    try {
      const result = await marketService.getSnapshot();
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:symbol/history', async (request, response, next) => {
    try {
      const symbol = request.params.symbol?.toUpperCase();
      const range = String(request.query.range ?? '1M').toUpperCase();

      if (!COMMODITY_SYMBOLS.includes(symbol as (typeof COMMODITY_SYMBOLS)[number])) {
        response.status(400).json({ error: 'Unsupported commodity symbol' });
        return;
      }

      if (!CHART_RANGES.includes(range as (typeof CHART_RANGES)[number])) {
        response.status(400).json({ error: 'Unsupported chart range' });
        return;
      }

      const result = await marketService.getHistory(
        symbol as (typeof COMMODITY_SYMBOLS)[number],
        range as (typeof CHART_RANGES)[number]
      );
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
