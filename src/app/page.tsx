import Link from "next/link";

export default function HomePage(): React.ReactElement {
	return (
		<main style={{ maxWidth: "48rem", margin: "0 auto", padding: "2rem", lineHeight: 1.6 }}>
			<h1>Starter point</h1>
			<p>
				Plantilla para apps <strong>web + Android (Capacitor)</strong> con backend Next.js,
				arquitectura hexagonal y ejemplos de auth y billing.
			</p>

			<h2>Qué incluye (activo)</h2>
			<ul>
				<li>
					<code>src/contexts/identity</code> — usuarios, registro, login JWT en cookie, perfil
				</li>
				<li>
					<code>src/contexts/billing</code> — Google Play verify/sync + demo de plan en local
				</li>
				<li>
					<code>src/contexts/shared</code> — Postgres, DI (diod), HTTP helpers
				</li>
				<li>
					Capacitor: <code>npm run build:capacitor</code>, <code>capacitor.config.ts</code>
				</li>
				<li>
					CORS para WebView Android en <code>src/middleware.ts</code>
				</li>
			</ul>

			<h2>Referencia legacy</h2>
			<p>
				El código RAG/MOOC/Femturisme vive en <code>src/contexts/legacy/</code> (sin DI ni APIs
				activas). SQL en <code>databases/legacy/</code>.
			</p>

			<h2>Empezar</h2>
			<ol>
				<li>
					<code>docker compose up -d</code> (Postgres + schema <code>starter</code>)
				</li>
				<li>
					Copiar <code>.env.example</code> → <code>.env.local</code> y definir{" "}
					<code>AUTH_SECRET</code>
				</li>
				<li>
					<code>npm install && npm run dev</code>
				</li>
			</ol>

			<p style={{ marginTop: "2rem" }}>
				<Link href="/login">Iniciar sesión</Link>
				{" · "}
				<Link href="/register">Crear cuenta</Link>
				{" · "}
				<Link href="/profile">Ver perfil</Link>
			</p>
		</main>
	);
}
