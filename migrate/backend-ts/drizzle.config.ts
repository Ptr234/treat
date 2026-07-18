import { defineConfig } from 'drizzle-kit';

// Used by `drizzle-kit generate` / `drizzle-kit studio` (local CLI tooling
// only — never bundled into the Worker). Point DATABASE_URL at the Neon
// connection string directly (not through Hyperdrive) for these commands.
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
});
