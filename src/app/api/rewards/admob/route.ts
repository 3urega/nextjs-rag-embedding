import { NextResponse } from "next/server";

type Body = {
	userId: string;
	rewardType?: string;
};

/**
 * Registra una recompensa tras rewarded completado en cliente.
 * Sustituye la lógica por la de tu producto (desbloqueo, créditos, etc.).
 */
export async function POST(request: Request): Promise<NextResponse> {
	const body = (await request.json()) as Body;
	if (!body.userId) {
		return NextResponse.json({ error: "userId required" }, { status: 400 });
	}

	// Stub: persistir en DB o aplicar reglas de negocio cuando integres AdMob.
	return NextResponse.json({
		ok: true,
		recorded: false,
		message: "Stub: conectar con AdMob y persistencia de recompensas",
	});
}
