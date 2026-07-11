import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './env.js';
import { logger } from './logger.js';
import { prisma } from './prisma.js';
import { UPLOADS_DIR } from './lib/uploads.js';
import { authRouter } from './modules/auth/authRoutes.js';
import { skillsRouter } from './modules/skills/skillsRoutes.js';
import { followRouter } from './modules/follow/followRoutes.js';
import { usersRouter } from './modules/users/usersRoutes.js';
import { eventsRouter } from './modules/events/eventsRoutes.js';
import { messagesRouter } from './modules/messages/messagesRoutes.js';
import { reviewsRouter } from './modules/reviews/reviewsRoutes.js';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      // We serve user-uploaded images; allow cross-origin resource access
      // from the Vite dev origin.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', db: 'up' });
    } catch (err) {
      logger.error({ err }, 'db health check failed');
      res.status(503).json({ status: 'degraded', db: 'down' });
    }
  });

  app.use('/auth', authRouter);
  app.use(skillsRouter);
  app.use(followRouter);
  app.use(usersRouter);
  app.use(eventsRouter);
  app.use(messagesRouter);
  app.use(reviewsRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, 'unhandled error');
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}
