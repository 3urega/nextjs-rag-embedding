import "reflect-metadata";

import { NextResponse } from "next/server";

import { SyncUserPlanFromGooglePlay } from "../../../../../contexts/billing/google_play_subscription/application/sync/SyncUserPlanFromGooglePlay";
import { UserDoesNotExist } from "../../../../../contexts/identity/users/domain/UserDoesNotExist";
import { container } from "../../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { executeWithErrorHandling } from "../../../../../contexts/shared/infrastructure/http/executeWithErrorHandling";
import { HttpNextResponse } from "../../../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { getAuthenticatedUserId } from "../../../../../lib/auth/session";

type Body = {
	userId?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
	return executeWithErrorHandling(
		async () => {
			const body = (await request.json()) as Body;
			const userId = (await getAuthenticatedUserId(request)) ?? body.userId;
			if (!userId) {
				return NextResponse.json({ error: { description: "Unauthorized" } }, { status: 401 });
			}

			const sync = container.get(SyncUserPlanFromGooglePlay);
			const result = await sync.run(userId);

			return NextResponse.json({ ok: true, plan: result.plan });
		},
		(error: UserDoesNotExist) => {
			if (error instanceof UserDoesNotExist) {
				return HttpNextResponse.domainError(error, 404);
			}
		},
	);
}
