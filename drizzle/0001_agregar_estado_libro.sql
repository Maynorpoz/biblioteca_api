CREATE TYPE "public"."estado_libro" AS ENUM('disponible', 'prestado');--> statement-breakpoint
ALTER TABLE "libros" ADD COLUMN "estado" "estado_libro" DEFAULT 'disponible' NOT NULL;