import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { addUserSkillSchema, matchSortSchema } from '@skillswap/shared';
import * as skillsService from './skillsService.js';
import { SkillError } from './skillsService.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const skillsRouter = Router();

skillsRouter.get('/skills', async (_req, res, next) => {
  try {
    res.json(await skillsService.listAllSkills());
  } catch (err) {
    next(err);
  }
});

skillsRouter.get('/users/:username/skills', async (req, res, next) => {
  try {
    res.json(await skillsService.getUserSkillsByUsername(req.params.username));
  } catch (err) {
    next(err);
  }
});

skillsRouter.post('/users/me/skills', requireAuth, async (req, res, next) => {
  try {
    const input = addUserSkillSchema.parse(req.body);
    const added = await skillsService.addUserSkill(req.user!.sub, input);
    res.status(201).json(added);
  } catch (err) {
    next(err);
  }
});

skillsRouter.delete('/users/me/skills/:skillId', requireAuth, async (req, res, next) => {
  try {
    const skillId = z.coerce.number().int().positive().parse(req.params.skillId);
    await skillsService.removeUserSkill(req.user!.sub, skillId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

const matchesQuerySchema = z.object({
  skillId: z.coerce.number().int().positive(),
  sort: matchSortSchema.optional(),
});

skillsRouter.get('/matches', requireAuth, async (req, res, next) => {
  try {
    const { skillId, sort } = matchesQuerySchema.parse(req.query);
    const results = await skillsService.findMatches(req.user!.sub, skillId, sort ?? 'points');
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
skillsRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SkillError) {
    const status = err.code === 'CONFLICT' ? 409 : err.code === 'NOT_FOUND' ? 404 : 400;
    res.status(status).json({ error: err.message, code: err.code });
    return;
  }
  if (err && typeof err === 'object' && 'issues' in err) {
    res.status(400).json({ error: 'validation_failed', issues: (err as { issues: unknown }).issues });
    return;
  }
  next(err);
});
