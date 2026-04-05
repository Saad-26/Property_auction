import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
