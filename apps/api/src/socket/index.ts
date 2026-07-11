import type { Server as HttpServer } from 'node:http';
import { Server as IOServer, type Socket } from 'socket.io';
import { verifyToken } from '../lib/jwt.js';
import { logger } from '../logger.js';
import { env } from '../env.js';

type AuthedSocket = Socket & { data: { userId: string; username: string } };

let io: IOServer | null = null;

export function initSocket(httpServer: HttpServer): IOServer {
  io = new IOServer(httpServer, {
    cors: { origin: env.CORS_ORIGIN },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token ?? '';
    if (!token || typeof token !== 'string') {
      next(new Error('missing token'));
      return;
    }
    try {
      const payload = verifyToken(token);
      (socket as AuthedSocket).data.userId = payload.sub;
      (socket as AuthedSocket).data.username = payload.username;
      next();
    } catch {
      next(new Error('invalid token'));
    }
  });

  io.on('connection', (rawSocket) => {
    const socket = rawSocket as AuthedSocket;
    const userId = socket.data.userId;
    logger.debug({ userId, sid: socket.id }, 'socket connected');

    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      logger.debug({ userId, sid: socket.id }, 'socket disconnected');
    });
  });

  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(`user:${userId}`).emit(event, payload);
}
