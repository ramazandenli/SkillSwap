import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';

let socket: Socket | null = null;

export function ensureSocket(): Socket {
  if (socket) return socket;
  socket = io('/', {
    path: '/socket.io',
    autoConnect: false,
    auth: (cb) => cb({ token: getAccessToken() ?? '' }),
  });
  return socket;
}

export function connectSocket() {
  const s = ensureSocket();
  if (!s.connected) s.connect();
}

export function disconnectSocket() {
  socket?.disconnect();
}

export function getSocket(): Socket | null {
  return socket;
}
