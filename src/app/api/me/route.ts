import "reflect-metadata";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { UserFinder } from "../../../contexts/mooc/users/application/find/UserFinder";
import { UserDoesNotExist } from "../../../contexts/mooc/users/domain/UserDoesNotExist";
import { container } from "../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { executeWithErrorHandling } from "../../../contexts/shared/infrastructure/http/executeWithErrorHandling";
import { HttpNextResponse } from "../../../contexts/shared/infrastructure/http/HttpNextResponse";

/**
 * MVP sin JWT: pasa el usuario con cabecera `x-user-id`.
 * Sustituir por sesión/JWT cuando integres auth.
 */
export async function GET(request: Request): Promise<NextResponse> {
	return executeWithErrorHandling(
		async () => {
			const userId = request.headers.get("x-user-id");
			if (!userId) {
				return NextResponse.json(
					{ error: { description: "Missing x-user-id header" } },
					{ status: 400 },
				);
			}

			const finder = container.get(UserFinder);
			const user = await finder.find(userId);

			return NextResponse.json({
				id: user.id.value,
				plan: user.plan,
				email: user.email.value,
			});
		},
		(error: UserDoesNotExist) => {
			if (error instanceof UserDoesNotExist) {
				return HttpNextResponse.domainError(error, 404);
			}
		},
	);
}
