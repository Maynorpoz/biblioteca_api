import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  // Tabla donde Drizzle registra qué migraciones ya se aplicaron
  migrations: {
    schema: 'drizzle',
    table: '__drizzle_migrations',
  },
  strict: true,
  verbose: true,
});
