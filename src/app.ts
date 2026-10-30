import express from 'express';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/error-handler.js';
import { libroRouter } from './routes/libro.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ estado: 'ok' });
});

app.use('/api/libros', libroRouter);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);
