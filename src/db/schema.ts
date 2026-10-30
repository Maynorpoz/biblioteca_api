import { integer, pgEnum, pgTable, smallint, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// Migración 0001: estado de disponibilidad del libro
export const estadoLibroEnum = pgEnum('estado_libro', ['disponible', 'prestado']);

export const libros = pgTable('libros', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  autor: varchar('autor', { length: 150 }).notNull(),
  isbn: varchar('isbn', { length: 13 }).notNull().unique(),
  editorial: varchar('editorial', { length: 120 }),
  anioPublicacion: smallint('anio_publicacion'),
  numeroPaginas: integer('numero_paginas'),
  genero: varchar('genero', { length: 60 }),
  idioma: varchar('idioma', { length: 40 }).notNull().default('Español'),
  paisPublicacion: varchar('pais_publicacion', { length: 60 }).notNull().default('Guatemala'),
  sinopsis: text('sinopsis'),
  // Agregado en la migración 0001
  estado: estadoLibroEnum('estado').notNull().default('disponible'),
  fechaRegistro: timestamp('fecha_registro', { withTimezone: true }).notNull().defaultNow(),
});

export type Libro = typeof libros.$inferSelect;
export type NuevoLibro = typeof libros.$inferInsert;
export type EstadoLibro = (typeof estadoLibroEnum.enumValues)[number];
