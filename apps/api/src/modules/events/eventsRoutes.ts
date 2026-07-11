import { Router, type Request, type Response, type NextFunction } from 'express';
import { createEventSchema } from '@skillswap/shared';
import * as eventsService from './eventsService.js';
import { EventError } from './eventsService.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const eventsRouter = Router();

eventsRouter.post('/events', requireAuth, async (req, res, next) => {
  try {
    const input = createEventSchema.parse(req.body);
    const dto = await eventsService.createEvent(req.user!.sub, input);
    res.status(201).json(dto);
  } catch (err) {
    next(err);
  }
});

eventsRouter.post('/events/:id/accept', requireAuth, async (req, res, next) => {
  try {
    const dto = await eventsService.acceptEvent(req.user!.sub, String(req.params.id));
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

eventsRouter.post('/events/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const dto = await eventsService.completeEvent(req.user!.sub, String(req.params.id));
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

eventsRouter.delete('/events/:id', requireAuth, async (req, res, next) => {
  try {
    await eventsService.cancelEvent(req.user!.sub, String(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

eventsRouter.get('/users/:username/events', requireAuth, async (req, res, next) => {
  try {
    const events = await eventsService.listEventsForUsername(
      String(req.params.username),
      req.user!.sub,
    );
    res.json(events);
  } catch (err) {
    next(err);
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
eventsRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof EventError) {
    const status =
      err.code === 'NOT_FOUND'
        ? 404
        : err.code === 'FORBIDDEN'
          ? 403
          : err.code === 'BAD_STATE'
            ? 409
            : 400;
    res.status(status).json({ error: err.message, code: err.code });
    return;
  }
  if (err && typeof err === 'object' && 'issues' in err) {
    res
      .status(400)
      .json({ error: 'validation_failed', issues: (err as { issues: unknown }).issues });
    return;
  }
  next(err);
});
