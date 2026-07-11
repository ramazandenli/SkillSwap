import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './env.js';
import { logger } from './logger.js';
import { initSocket } from './socket/index.js';

const app = createApp();
const server = createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
