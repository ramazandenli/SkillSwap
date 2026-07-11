import { Router, type Request, type Response, type NextFunction } from 'express';
import { signupSchema, loginSchema } from '@skillswap/shared';
import * as authService from './authService.js';
import { AuthError } from './authService.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const authRouter = Router();

authRouter.post('/signup', async (req, res, next) => {
  try {
    const input = signupSchema.parse(req.body);
    const { user, token } = await authService.signup(input);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const { user, token } = await authService.login(input);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user!.sub);
    if (!user) {
      res.status(404).json({ error: 'user not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
authRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AuthError) {
    const status = err.code === 'CONFLICT' ? 409 : 401;
    res.status(status).json({ error: err.message, code: err.code });
    return;
  }
  if (err && typeof err === 'object' && 'issues' in err) {
    res.status(400).json({ error: 'validation_failed', issues: (err as { issues: unknown }).issues });
    return;
  }
  next(err);
});
