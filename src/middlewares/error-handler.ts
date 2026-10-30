import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

export const rutaNoEncontrada: RequestHandler = (req, res) => {
  res.status(404).json({ error: `La ruta ${req.method} ${req.originalUrl} no existe` });
};

export const manejadorErrores: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Datos inválidos',
      detalles: err.issues.map((issue) => ({
        campo: issue.path.join('.') || null,
        mensaje: issue.message,
      })),
    });
    return;
  }

  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
    return;
  }

  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'El cuerpo de la petición supera el tamaño permitido' });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: env.NODE_ENV === 'production' ? 'Error interno del servidor' : String(err?.message ?? err),
  });
};
