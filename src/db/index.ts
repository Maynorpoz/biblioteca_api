import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/env.js';
import * as schema from './schema.js';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

// Evita que el proceso se caiga si PostgreSQL cierra una conexión inactiva
pool.on('error', (error) => {
  console.error('Error en una conexión inactiva de PostgreSQL:', error.message);
});

export const db = drizzle({ client: pool, schema });
