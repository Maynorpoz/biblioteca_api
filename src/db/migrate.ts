// Aplica las migraciones pendientes sin necesitar drizzle-kit.
// Uso (producción/CI): npm run build && npm run db:migrate:prod
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './index.js';

try {
  console.log('Aplicando migraciones pendientes...');
  await migrate(db, {
    migrationsFolder: './drizzle',
    migrationsSchema: 'drizzle',
    migrationsTable: '__drizzle_migrations',
  });
  console.log('Migraciones aplicadas correctamente');
} catch (error) {
  console.error('Error al aplicar las migraciones:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
