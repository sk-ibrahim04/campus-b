import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to CampusSynapse realtime gateway:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected from realtime gateway.');
    });
  }
  return socket;
}
