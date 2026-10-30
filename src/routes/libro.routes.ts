import { Router } from 'express';
import {
  actualizarLibro,
  crearLibro,
  eliminarLibro,
  listarLibros,
  obtenerLibro,
  reemplazarLibro,
} from '../controllers/libro.controller.js';

// Express 5 captura automáticamente los errores de los handlers async
export const libroRouter = Router();

libroRouter.get('/', listarLibros);
libroRouter.post('/', crearLibro);
libroRouter.get('/:id', obtenerLibro);
libroRouter.put('/:id', reemplazarLibro);
libroRouter.patch('/:id', actualizarLibro);
libroRouter.delete('/:id', eliminarLibro);
