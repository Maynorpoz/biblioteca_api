import type { Request, Response } from 'express';
import { and, asc, eq, ilike, type SQL } from 'drizzle-orm';
import { db } from '../db/index.js';
import { libros } from '../db/schema.js';
import { conflicto, noEncontrado } from '../utils/http-error.js';
import {
  actualizarLibroSchema,
  crearLibroSchema,
  idParamSchema,
  listarLibrosQuerySchema,
  reemplazarLibroSchema,
} from '../validators/libro.validator.js';

// Código de PostgreSQL para violación de restricción UNIQUE
const UNIQUE_VIOLATION = '23505';

function esIsbnDuplicado(error: unknown): boolean {
  const causa = (error as { cause?: { code?: string } })?.cause ?? error;
  return (causa as { code?: string })?.code === UNIQUE_VIOLATION;
}

async function guardar<T>(operacion: () => Promise<T>): Promise<T> {
  try {
    return await operacion();
  } catch (error) {
    if (esIsbnDuplicado(error)) throw conflicto('Ya existe un libro registrado con ese ISBN');
    throw error;
  }
}

export async function listarLibros(req: Request, res: Response) {
  const filtros = listarLibrosQuerySchema.parse(req.query);
  const condiciones: SQL[] = [];
  if (filtros.autor) condiciones.push(ilike(libros.autor, `%${filtros.autor}%`));
  if (filtros.genero) condiciones.push(ilike(libros.genero, `%${filtros.genero}%`));
  if (filtros.estado) condiciones.push(eq(libros.estado, filtros.estado));

  const resultado = await db
    .select()
    .from(libros)
    .where(and(...condiciones))
    .orderBy(asc(libros.id));

  res.status(200).json({ total: resultado.length, datos: resultado });
}

export async function obtenerLibro(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const [libro] = await db.select().from(libros).where(eq(libros.id, id));
  if (!libro) throw noEncontrado(`No existe un libro con id ${id}`);
  res.status(200).json(libro);
}

export async function crearLibro(req: Request, res: Response) {
  const datos = crearLibroSchema.parse(req.body);
  const [libro] = await guardar(() => db.insert(libros).values(datos).returning());
  res.status(201).location(`/api/libros/${libro!.id}`).json(libro);
}

export async function reemplazarLibro(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const datos = reemplazarLibroSchema.parse(req.body);
  // En un PUT los campos opcionales omitidos vuelven a su valor por defecto
  const completo = {
    editorial: null,
    anioPublicacion: null,
    numeroPaginas: null,
    genero: null,
    idioma: 'Español',
    paisPublicacion: 'Guatemala',
    sinopsis: null,
    estado: 'disponible' as const,
    ...datos,
  };
  const [libro] = await guardar(() => db.update(libros).set(completo).where(eq(libros.id, id)).returning());
  if (!libro) throw noEncontrado(`No existe un libro con id ${id}`);
  res.status(200).json(libro);
}

export async function actualizarLibro(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const datos = actualizarLibroSchema.parse(req.body);
  const [libro] = await guardar(() => db.update(libros).set(datos).where(eq(libros.id, id)).returning());
  if (!libro) throw noEncontrado(`No existe un libro con id ${id}`);
  res.status(200).json(libro);
}

export async function eliminarLibro(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const [eliminado] = await db.delete(libros).where(eq(libros.id, id)).returning({ id: libros.id });
  if (!eliminado) throw noEncontrado(`No existe un libro con id ${id}`);
  res.status(204).send();
}
