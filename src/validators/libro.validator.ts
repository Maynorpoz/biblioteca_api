import { z } from 'zod';
import { estadoLibroEnum } from '../db/schema.js';

// Mensajes de error de Zod en español
z.config(z.locales.es());

const anioActual = new Date().getFullYear();

// Acepta ISBN-10 o ISBN-13, con o sin guiones/espacios (se guardan sin ellos)
const isbn = z
  .string()
  .trim()
  .transform((valor) => valor.replace(/[-\s]/g, '').toUpperCase())
  .pipe(z.string().regex(/^(\d{9}[\dX]|\d{13})$/, 'El ISBN debe tener 10 o 13 dígitos'));

const estado = z.enum(estadoLibroEnum.enumValues, {
  error: `El estado debe ser uno de: ${estadoLibroEnum.enumValues.join(', ')}`,
});

const textoOpcional = (max: number) => z.string().trim().min(1).max(max).nullable().optional();

export const crearLibroSchema = z.strictObject({
  titulo: z.string().trim().min(1, 'El título es obligatorio').max(255),
  autor: z.string().trim().min(1, 'El autor es obligatorio').max(150),
  isbn,
  editorial: textoOpcional(120),
  anioPublicacion: z
    .number()
    .int()
    .min(1450, 'El año de publicación no es válido')
    .max(anioActual, 'El año de publicación no puede ser futuro')
    .nullable()
    .optional(),
  numeroPaginas: z.number().int().positive('El número de páginas debe ser mayor que 0').nullable().optional(),
  genero: textoOpcional(60),
  idioma: z.string().trim().min(1).max(40).optional(),
  paisPublicacion: z.string().trim().min(1).max(60).optional(),
  sinopsis: z.string().trim().max(5000).nullable().optional(),
  estado: estado.optional(),
});

// PUT: reemplazo completo, se exigen los mismos campos que al crear
export const reemplazarLibroSchema = crearLibroSchema;

// PATCH: todos los campos opcionales, pero al menos uno
export const actualizarLibroSchema = crearLibroSchema
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, 'Envía al menos un campo para actualizar');

export const idParamSchema = z.object({
  id: z.coerce.number({ error: 'El id debe ser numérico' }).int('El id debe ser un número entero').positive('El id debe ser positivo'),
});

export const listarLibrosQuerySchema = z.strictObject({
  autor: z.string().trim().min(1).optional(),
  genero: z.string().trim().min(1).optional(),
  estado: estado.optional(),
});
