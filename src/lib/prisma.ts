import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
  // Resolve relative path to absolute for better-sqlite3
  const resolvedUrl = dbUrl.startsWith('file:.')
    ? `file:${path.resolve(process.cwd(), dbUrl.replace('file:', ''))}`
    : dbUrl;
  const adapter = new PrismaBetterSqlite3({ url: resolvedUrl });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
