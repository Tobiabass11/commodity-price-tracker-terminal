import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),
  ALLOWED_ORIGIN: z.string().default('*'),
  ALPHA_VANTAGE_API_KEY: z.string().min(1).default('demo'),
  NEWS_API_KEY: z.string().min(1).default('demo'),
  SNAPSHOT_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  HISTORY_TTL_SECONDS: z.coerce.number().int().positive().default(1800),
  NEWS_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(12000)
});

export const env = envSchema.parse(process.env);
