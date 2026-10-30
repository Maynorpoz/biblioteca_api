import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/index.js';

const servidor = app.listen(env.PORT, () => {
  console.log(`Biblioteca API escuchando en http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Cierre ordenado: deja de aceptar peticiones y libera las conexiones a la BD
function apagar(senal: string) {
  console.log(`${senal} recibido, cerrando el servidor...`);
  servidor.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => apagar('SIGINT'));
process.on('SIGTERM', () => apagar('SIGTERM'));
