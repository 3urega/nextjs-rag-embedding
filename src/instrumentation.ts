export function register(): void {
	if (process.env.NEXT_RUNTIME !== "nodejs") {
		return;
	}

	// No importar `loadProjectEnv` aquí: el bundler de Next puede fallar al resolver módulos Node.
	// La carga ordenada ocurre en `diod.config.ts` al arrancar las rutas API.

	if (process.env.NODE_ENV !== "production") {
		return;
	}

	const missing: string[] = [];
	if (!process.env.POSTGRES_PASSWORD && !process.env.DATABASE_URL) {
		missing.push("POSTGRES_* or DATABASE_URL");
	}

	if (missing.length > 0) {
		// eslint-disable-next-line no-console
		console.warn(
			"[instrumentation] Producción: faltan variables de entorno críticas para la base de datos:",
			missing.join(", "),
		);
	}
}
