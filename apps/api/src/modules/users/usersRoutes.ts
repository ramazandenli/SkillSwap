import { Router, type Request, type Response, type NextFunction } from 'express';
import { updateProfileSchema } from '@skillswap/shared';
import * as usersService from './usersService.js';
import { UserError } from './usersService.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { avatarUpload } from '../../lib/uploads.js';

export const usersRouter = Router();

usersRouter.get('/users/:username', async (req, res, next) => {
  try {
    const user = await usersService.getPublicProfileByUsername(String(req.params.username));
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

usersRouter.patch('/users/me', requireAuth, async (req, res, next) => {
  try {
    const input = updateProfileSchema.parse(req.body);
    const user = await usersService.updateProfile(req.user!.sub, input);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

usersRouter.post(
  '/users/me/avatar',
  requireAuth,
  (req, res, next) => {
    avatarUpload.single('avatar')(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message ?? 'upload failed' });
        return;
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'no file uploaded' });
        return;
      }
      const publicUrl = `/uploads/${req.file.filename}`;
      const user = await usersService.setAvatar(req.user!.sub, publicUrl);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
);

usersRouter.delete('/users/me/avatar', requireAuth, async (req, res, next) => {
  try {
    const user = await usersService.removeAvatar(req.user!.sub);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
usersRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof UserError) {
    res.status(err.code === 'NOT_FOUND' ? 404 : 400).json({ error: err.message, code: err.code });
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
