CREATE TABLE "libros" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "libros_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"titulo" varchar(255) NOT NULL,
	"autor" varchar(150) NOT NULL,
	"isbn" varchar(13) NOT NULL,
	"editorial" varchar(120),
	"anio_publicacion" smallint,
	"numero_paginas" integer,
	"genero" varchar(60),
	"idioma" varchar(40) DEFAULT 'Español' NOT NULL,
	"pais_publicacion" varchar(60) DEFAULT 'Guatemala' NOT NULL,
	"sinopsis" text,
	"fecha_registro" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "libros_isbn_unique" UNIQUE("isbn")
);
