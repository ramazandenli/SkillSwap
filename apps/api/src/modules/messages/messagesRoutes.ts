import { Router, type Request, type Response, type NextFunction } from 'express';
import { sendMessageSchema } from '@skillswap/shared';
import * as messagesService from './messagesService.js';
import { MessageError } from './messagesService.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { emitToUser } from '../../socket/index.js';

export const messagesRouter = Router();

messagesRouter.get('/messages/threads', requireAuth, async (req, res, next) => {
  try {
    res.json(await messagesService.listThreads(req.user!.sub));
  } catch (err) {
    next(err);
  }
});

messagesRouter.get('/messages/with/:username', requireAuth, async (req, res, next) => {
  try {
    const result = await messagesService.listThreadMessages(
      req.user!.sub,
      String(req.params.username),
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

messagesRouter.post('/messages', requireAuth, async (req, res, next) => {
  try {
    const input = sendMessageSchema.parse(req.body);
    const { dto, toId } = await messagesService.sendMessage(req.user!.sub, input);
    // Notify both endpoints so open windows on either side update in real time.
    emitToUser(toId, 'message:new', dto);
    emitToUser(req.user!.sub, 'message:new', dto);
    res.status(201).json(dto);
  } catch (err) {
    next(err);
  }
});

messagesRouter.post('/messages/mark-read/:username', requireAuth, async (req, res, next) => {
  try {
    const { peerId, lastReadMessageId } = await messagesService.markThreadRead(
      req.user!.sub,
      String(req.params.username),
    );
    if (lastReadMessageId) {
      emitToUser(peerId, 'message:read', {
        byUserId: req.user!.sub,
        upToMessageId: lastReadMessageId,
      });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
messagesRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MessageError) {
    res
      .status(err.code === 'NOT_FOUND' ? 404 : err.code === 'FORBIDDEN' ? 403 : 400)
      .json({ error: err.message, code: err.code });
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
