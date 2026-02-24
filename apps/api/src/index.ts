import { createApp } from './app.js';
import { env } from './config.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`[api] listening on port ${env.PORT}`);
});
