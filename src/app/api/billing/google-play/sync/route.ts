import "reflect-metadata";

import { NextResponse } from "next/server";

import { SyncUserPlanFromGooglePlay } from "../../../../../contexts/billing/google_play_subscription/application/sync/SyncUserPlanFromGooglePlay";
import { UserDoesNotExist } from "../../../../../contexts/mooc/users/domain/UserDoesNotExist";
import { container } from "../../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { executeWithErrorHandling } from "../../../../../contexts/shared/infrastructure/http/executeWithErrorHandling";
import { HttpNextResponse } from "../../../../../contexts/shared/infrastructure/http/HttpNextResponse";

type Body = {
	userId: string;
};

export async function POST(request: Request): Promise<NextResponse> {
	return executeWithErrorHandling(
		async () => {
			const body = (await request.json()) as Body;
			if (!body.userId) {
				return NextResponse.json({ error: { description: "userId is required" } }, { status: 400 });
			}

			const sync = container.get(SyncUserPlanFromGooglePlay);
			const result = await sync.run(body.userId);

			return NextResponse.json({ ok: true, plan: result.plan });
		},
		(error: UserDoesNotExist) => {
			if (error instanceof UserDoesNotExist) {
				return HttpNextResponse.domainError(error, 404);
			}
		},
	);
}
