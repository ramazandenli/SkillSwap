import { Router, type Request, type Response, type NextFunction } from 'express';
import { createReviewSchema } from '@skillswap/shared';
import * as reviewsService from './reviewsService.js';
import { ReviewError } from './reviewsService.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const reviewsRouter = Router();

reviewsRouter.post('/events/:id/reviews', requireAuth, async (req, res, next) => {
  try {
    const input = createReviewSchema.parse(req.body);
    const review = await reviewsService.createReview(
      req.user!.sub,
      String(req.params.id),
      input,
    );
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

reviewsRouter.get('/users/:username/reviews', async (req, res, next) => {
  try {
    res.json(await reviewsService.listReviewsForUser(String(req.params.username)));
  } catch (err) {
    next(err);
  }
});

reviewsRouter.get('/users/:username/rating', async (req, res, next) => {
  try {
    res.json(await reviewsService.getRatingSummary(String(req.params.username)));
  } catch (err) {
    next(err);
  }
});

reviewsRouter.get('/events/:id/my-review', requireAuth, async (req, res, next) => {
  try {
    const review = await reviewsService.myReviewOnEvent(req.user!.sub, String(req.params.id));
    res.json({ review });
  } catch (err) {
    next(err);
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
reviewsRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ReviewError) {
    const status =
      err.code === 'NOT_FOUND'
        ? 404
        : err.code === 'FORBIDDEN'
          ? 403
          : err.code === 'BAD_STATE'
            ? 409
            : err.code === 'CONFLICT'
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
