import { Router, type Request, type Response, type NextFunction } from 'express';
import * as followService from './followService.js';
import { FollowError } from './followService.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const followRouter = Router();

followRouter.post('/users/:username/follow', requireAuth, async (req, res, next) => {
  try {
    await followService.follow(req.user!.sub, String(req.params.username));
    res.status(201).end();
  } catch (err) {
    next(err);
  }
});

followRouter.delete('/users/:username/follow', requireAuth, async (req, res, next) => {
  try {
    await followService.unfollow(req.user!.sub, String(req.params.username));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

followRouter.get('/users/:username/followers', async (req, res, next) => {
  try {
    res.json(await followService.listFollowers(String(req.params.username)));
  } catch (err) {
    next(err);
  }
});

followRouter.get('/users/:username/following', async (req, res, next) => {
  try {
    res.json(await followService.listFollowing(String(req.params.username)));
  } catch (err) {
    next(err);
  }
});

followRouter.get('/users/:username/follow-counts', async (req, res, next) => {
  try {
    res.json(await followService.counts(String(req.params.username)));
  } catch (err) {
    next(err);
  }
});

followRouter.get('/users/:username/follow-status', requireAuth, async (req, res, next) => {
  try {
    res.json(await followService.status(req.user!.sub, String(req.params.username)));
  } catch (err) {
    next(err);
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
followRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof FollowError) {
    const status =
      err.code === 'NOT_FOUND'
        ? 404
        : err.code === 'SELF_FOLLOW'
          ? 400
          : err.code === 'CONFLICT'
            ? 409
            : 400;
    res.status(status).json({ error: err.message, code: err.code });
    return;
  }
  next(err);
});
