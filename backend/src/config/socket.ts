import { Server } from 'socket.io';
import http from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const pubClient = new Redis(REDIS_URL);
const subClient = pubClient.duplicate();

export function setupSocket(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: '*', // For development, allow all origins
      methods: ['GET', 'POST'],
    },
  });

  io.adapter(createAdapter(pubClient, subClient));

  return io;
}
