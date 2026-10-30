# Biblioteca API

API REST para gestionar el catálogo de libros de una biblioteca. Construida con **Express 5 + TypeScript + PostgreSQL**, usando **Drizzle ORM** y migraciones versionadas generadas con `drizzle-kit`. Los datos se validan con **Zod**.

## Tecnologías

- Node.js ≥ 20 y TypeScript
- Express 5
- PostgreSQL 16 (con Docker Compose)
- Drizzle ORM + drizzle-kit (migraciones)
- Zod (validación de datos y de variables de entorno)

## Estructura del proyecto

```
.
├── drizzle/                                # Migraciones (se versionan en Git)
│   ├── 0000_crear_tabla_libros.sql         # Migración inicial
│   ├── 0001_agregar_estado_libro.sql       # Evolución del esquema
│   └── meta/                               # _journal.json + snapshots
├── src/
│   ├── config/env.ts                       # Lectura y validación de variables de entorno
│   ├── db/
│   │   ├── schema.ts                       # Esquema de Drizzle (fuente de verdad)
│   │   ├── index.ts                        # Conexión a PostgreSQL
│   │   └── migrate.ts                      # Aplica migraciones sin drizzle-kit
│   ├── validators/libro.validator.ts       # Esquemas Zod
│   ├── controllers/libro.controller.ts     # Lógica de cada endpoint
│   ├── routes/libro.routes.ts              # Rutas /api/libros
│   ├── middlewares/error-handler.ts        # Respuestas de error 400/404/409/413/500
│   ├── utils/http-error.ts
│   ├── app.ts                              # Configuración de Express
│   └── server.ts                           # Arranque y cierre ordenado
├── docker-compose.yml
├── drizzle.config.ts
├── .env.example
└── package.json
```

## Instalación

```bash
git clone https://github.com/Maynorpoz/biblioteca_api.git
cd biblioteca_api
npm install
```

## Configuración

Copia el archivo de ejemplo y cambia la contraseña:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `development`, `test` o `production` |
| `PORT` | Puerto de la API (por defecto 3000) |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Credenciales con las que Docker crea la base de datos |
| `POSTGRES_PORT` | Puerto del host para PostgreSQL (por defecto 5433) |

> El puerto de `DATABASE_URL` debe coincidir con `POSTGRES_PORT`.

## Ejecución

```bash
# 1. Levantar PostgreSQL
docker compose up -d --wait

# 2. Aplicar las migraciones
npm run db:migrate

# 3. Iniciar la API en modo desarrollo
npm run dev
```

La API queda disponible en `http://localhost:3000`.

Para producción:

```bash
npm run build
npm run db:migrate:prod
npm start
```

## Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|---|---|---|---|
| GET | `/health` | Verifica que la API está activa | 200 |
| GET | `/api/libros` | Lista libros. Filtros opcionales: `?autor=`, `?genero=`, `?estado=` | 200 |
| GET | `/api/libros/:id` | Consulta un libro | 200 |
| POST | `/api/libros` | Crea un libro | 201 + cabecera `Location` |
| PUT | `/api/libros/:id` | Reemplaza todos los datos de un libro | 200 |
| PATCH | `/api/libros/:id` | Actualiza uno o más campos | 200 |
| DELETE | `/api/libros/:id` | Elimina un libro | 204 |

### Campos de un libro

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `titulo` | texto (máx. 255) | Sí | |
| `autor` | texto (máx. 150) | Sí | |
| `isbn` | texto | Sí | ISBN-10 o ISBN-13, único. Se aceptan guiones |
| `editorial` | texto | No | |
| `anioPublicacion` | entero | No | Entre 1450 y el año actual |
| `numeroPaginas` | entero | No | Mayor que 0 |
| `genero` | texto | No | |
| `idioma` | texto | No | Por defecto `Español` |
| `paisPublicacion` | texto | No | Por defecto `Guatemala` |
| `sinopsis` | texto | No | |
| `estado` | `disponible` \| `prestado` | No | Por defecto `disponible` |

### Códigos de error

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos, JSON mal formado, campos desconocidos o id no numérico |
| 404 | El libro o la ruta no existen |
| 409 | Ya existe un libro con ese ISBN |
| 413 | El cuerpo de la petición supera 100 kB |
| 500 | Error inesperado del servidor |

### Ejemplos

```bash
# Crear
curl -X POST http://localhost:3000/api/libros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"El Señor Presidente","autor":"Miguel Ángel Asturias","isbn":"978-84-376-0538-8","anioPublicacion":1946,"genero":"Novela"}'

# Listar / filtrar
curl http://localhost:3000/api/libros
curl "http://localhost:3000/api/libros?estado=prestado"

# Consultar uno
curl http://localhost:3000/api/libros/1

# Prestar un libro (actualización parcial)
curl -X PATCH http://localhost:3000/api/libros/1 \
  -H "Content-Type: application/json" -d '{"estado":"prestado"}'

# Eliminar
curl -X DELETE http://localhost:3000/api/libros/1
```

## Migraciones

El archivo `src/db/schema.ts` es la **fuente de verdad**. La base de datos nunca se modifica a mano: se cambia el esquema, se genera la migración SQL con `drizzle-kit` y se aplica.

### 1. Migración inicial: `0000_crear_tabla_libros`

Crea la tabla `libros` con sus datos bibliográficos (título, autor, ISBN único, editorial, año, páginas, género, idioma, país, sinopsis y fecha de registro).

```bash
npm run db:generate -- --name crear_tabla_libros
```

### 2. Evolución del esquema: `0001_agregar_estado_libro`

Para controlar los préstamos se agregó el **estado** del libro. Se creó el tipo enumerado `estado_libro` y la columna `estado` en la tabla `libros`:

```bash
npm run db:generate -- --name agregar_estado_libro
```

SQL generado:

```sql
CREATE TYPE "public"."estado_libro" AS ENUM('disponible', 'prestado');
ALTER TABLE "libros" ADD COLUMN "estado" "estado_libro" DEFAULT 'disponible' NOT NULL;
```

La columna tiene valor por defecto `disponible`, así que los libros que ya existían antes de la migración quedan marcados como disponibles y no se pierde ningún dato.

### Aplicar las migraciones

```bash
npm run db:migrate          # desarrollo (drizzle-kit)
npm run db:migrate:prod     # producción (después de npm run build)
```

Drizzle registra cada migración aplicada en la tabla `drizzle.__drizzle_migrations` y solo ejecuta las pendientes, por lo que se puede correr varias veces sin problema.

### Migraciones y Git

- Toda la carpeta `drizzle/` se sube al repositorio, incluyendo `meta/` (los snapshots que usa `drizzle-kit` para calcular la siguiente migración).
- Cada cambio de `schema.ts` se sube en el mismo commit que su migración.
- Una migración ya aplicada no se edita: si hay que corregir algo, se genera una nueva.
- `.env` no se sube; solo `.env.example`, sin secretos.

## Persistencia de datos

PostgreSQL guarda los datos en el volumen de Docker `biblioteca_data`, por lo que se conservan aunque se reinicie la API o el contenedor:

```bash
# Reiniciar la API (Ctrl + C y volver a iniciar)
npm run dev
curl http://localhost:3000/api/libros     # los libros siguen ahí

# Reiniciar también la base de datos
docker compose restart
curl http://localhost:3000/api/libros     # los libros siguen ahí
```

> `docker compose down -v` borra el volumen y por lo tanto los datos.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia la API con recarga automática |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm run typecheck` | Revisa los tipos sin compilar |
| `npm run db:generate` | Genera una migración a partir de los cambios en `schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes (drizzle-kit) |
| `npm run db:migrate:prod` | Aplica las migraciones con el script compilado |
| `npm run db:check` | Verifica la consistencia de las migraciones |
| `npm run db:studio` | Abre Drizzle Studio para ver los datos |
