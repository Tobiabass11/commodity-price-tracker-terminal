import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config.js';
import { createMarketRoutes } from './routes/marketRoutes.js';
import { createNewsRoutes } from './routes/newsRoutes.js';
import { MarketService } from './services/marketService.js';
import { NewsService } from './services/newsService.js';

interface AppDependencies {
  marketService?: MarketService;
  newsService?: NewsService;
}

export function createApp(dependencies: AppDependencies = {}): express.Express {
  const marketService = dependencies.marketService ?? new MarketService();
  const newsService = dependencies.newsService ?? new NewsService();

  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.ALLOWED_ORIGIN === '*' ? true : env.ALLOWED_ORIGIN
    })
  );
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_request: Request, response: Response) => {
    response.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/commodities', createMarketRoutes(marketService));
  app.use('/api/news', createNewsRoutes(newsService));

  app.use((error: Error, _request: Request, response: Response, _next: () => void) => {
    response.status(500).json({
      error: error.message || 'Unexpected server error'
    });
  });

  return app;
}
