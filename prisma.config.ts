import path from 'path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // @ts-ignore - Prisma 7 config format
  datasource: {
    url: `file:${path.resolve(process.cwd(), 'prisma', 'dev.db')}`,
  },
});
