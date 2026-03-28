// packages/db/prisma.config.ts

// Load .env files automatically (important in monorepo)
import 'dotenv/config';

import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  // Point to your schema (adjust if you renamed it)
  schema: './schema.prisma',

  // Optional: where migrations live (default is fine)
  migrations: {
    path: './prisma/migrations', // or just omit if default
  },

  datasource: {
    // This is REQUIRED for prisma migrate / generate / studio / db commands
    // Use the SAME variable name you had before
    url: env('DATABASE_URL'),

    // If you ever use a shadow database for migrations (rare for most projects):
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
});