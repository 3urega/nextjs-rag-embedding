# RAG embedding (Next.js)

Aplicación Next.js con arquitectura en capas (DDD / hexagonal), Postgres + pgvector para datos y búsqueda vectorial, y Ollama para embeddings y modelos de chat.

## Requisitos

- **Node.js** 18 o superior (recomendado alinear con CI).
- **Docker** y Docker Compose v2 (`docker compose`).
- Espacio en disco razonable para imágenes de Ollama y modelos.

## 1. Instalar dependencias

En la raíz del repositorio:

```bash
npm install
```

## 2. Arrancar la infraestructura con Docker

El fichero `compose.yml` define tres servicios:

| Servicio | Descripción | Puerto host |
| -------- | ----------- | ----------- |
| `eurega_rag_postgres_pgvector` | Postgres 16 con extensión pgvector | `5432` |
| `eurega_rag_ollama` | Ollama (LLM + embeddings) | `11434` |
| `eurega_rag_mariadb` | MariaDB (uso legado / tests MySQL) | `3306` |

Credenciales usadas también en código local (`PostgresConnection`, scripts): usuario `codely`, contraseña `c0d3ly7v`, base `postgres` (Postgres).

### Levantar todo

```bash
docker compose up -d
```

**Nota sobre MariaDB:** el servicio monta `./databases/codely.sql` como script de inicialización. Si ese archivo no existe en tu clon, el arranque de ese contenedor puede fallar. Para trabajar solo con Postgres + Ollama (flujo habitual de la app):

```bash
docker compose up -d eurega_rag_postgres_pgvector eurega_rag_ollama
```

La primera vez que Postgres arranca con un volumen vacío, ejecuta en orden los SQL de `databases/` montados en `/docker-entrypoint-initdb.d` (`0-enable-pgvector.sql`, `1-mooc.sql`, `2-femturisme.sql`): esquemas `mooc` y `femturisme`, tablas y extensión vector.

Si ya tenías datos en el volumen y cambias los SQL, hace falta borrar el volumen de Postgres (`docker compose down -v` y volver a subir) para repetir la inicialización.

## 3. Descargar modelos en Ollama

La aplicación y los scripts asumen Ollama en `http://localhost:11434`.

- **Embeddings** (`PostgresCourseRepository`, scripts `.mjs`): modelo `nomic-embed-text`.
- **Sugerencias con LLM** (`OllamaLlama31CourseSuggestionsGenerator`, `OllamaPlanSuggestionsGenerator`): modelo `llama3.1:8b`.

Con los contenedores en marcha:

```bash
docker compose exec eurega_rag_ollama ollama pull nomic-embed-text
docker compose exec eurega_rag_ollama ollama pull llama3.1:8b
```

(Si usas Ollama instalado en el host en lugar del contenedor, sustituye por `ollama pull ...` en tu terminal.)

## 4. Poblar la base de datos (datos + vectores)

Con **Postgres** y **Ollama** ya listos (y `nomic-embed-text` descargado):

**Cursos MOOC** (tabla `mooc.courses` con embeddings):

```bash
node src/app/scripts/run-create-courses.mjs
```

**Planes Femturisme** (tablas `femturisme.plans` y `femturisme.plan_chunks` con embeddings):

```bash
node src/app/scripts/run-create-femturisme.mjs
```

Los JSON de origen están en `src/app/scripts/courses.json` y `src/app/scripts/femturisme-plans.json`.

Existe también `src/app/scripts/create-courses.ts` (repositorio Postgres + dominio); para ejecutarlo hace falta una invocación TypeScript compatible con el proyecto (p. ej. desde el propio entorno de Next). En la práctica, los `.mjs` anteriores suelen ser la forma más directa de poblar datos.

## 5. Arrancar el proyecto en desarrollo

La app Next.js **no** va dentro de Docker en desarrollo; se ejecuta en tu máquina y se conecta a `localhost`.

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 6. Comandos útiles

| Comando | Uso |
| ------- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor tras `build` |
| `npm run lint` | ESLint |
| `npm run test` | Tests Jest (excluye `*.ci.test.ts`) |
| `npm run test:ci` | Solo tests `*.ci.test.ts` |

Para comprobar el proyecto de punta a punta en local: infra Docker + modelos Ollama + scripts de población + `npm run dev`.

## Variables de entorno

Gran parte de la configuración de bases de datos está **hardcodeada** a `localhost` y a las credenciales del `compose.yml` (ver `src/contexts/shared/infrastructure/dependency-injection/diod.config.ts` y `PostgresConnection`).

Algunos tests de integración / generadores alternativos pueden usar **`OPENAI_API_KEY`** (por ejemplo sugerencias vía OpenAI en tests CI). No es obligatoria para el flujo local con Ollama descrito arriba.

## Documentación del código

Convenciones y guías: carpeta `docs/` (mapa de entrada en `AGENTS.md`).
