// apps/api/src/lib/prisma.ts
import 'dotenv/config';  // ← Add this line FIRST (forces .env load from project root or cwd)

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Debug: Log to confirm env is loaded
console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? 'present' : 'MISSING or empty');
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL length:', process.env.DATABASE_URL.length);
  console.log('Has password?', process.env.DATABASE_URL.includes(':@') ? 'no password' : 'has password part');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString: process.env.DATABASE_URL,  // ← this must be string | undefined
    // If undefined → Pool will throw later, but better to catch early
  });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables!');
}

const adapter = new PrismaPg(globalForPrisma.pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;