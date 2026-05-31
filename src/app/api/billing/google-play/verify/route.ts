import "reflect-metadata";

import { NextResponse } from "next/server";

import { VerifyGooglePlayPurchase } from "../../../../../contexts/billing/google_play_subscription/application/verify/VerifyGooglePlayPurchase";
import { PurchaseTokenAlreadyLinked } from "../../../../../contexts/billing/google_play_subscription/domain/PurchaseTokenAlreadyLinked";
import { UserDoesNotExist } from "../../../../../contexts/identity/users/domain/UserDoesNotExist";
import { container } from "../../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { executeWithErrorHandling } from "../../../../../contexts/shared/infrastructure/http/executeWithErrorHandling";
import { HttpNextResponse } from "../../../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { getAuthenticatedUserId } from "../../../../../lib/auth/session";

type Body = {
	userId?: string;
	purchaseToken: string;
	productId: string;
};

export async function POST(request: Request): Promise<NextResponse> {
	return executeWithErrorHandling(
		async () => {
			const body = (await request.json()) as Body;
			const userId = (await getAuthenticatedUserId(request)) ?? body.userId;
			if (!userId || !body.purchaseToken || !body.productId) {
				return NextResponse.json(
					{
						error: {
							description: "purchaseToken and productId are required; userId from session or body",
						},
					},
					{ status: 400 },
				);
			}

			const verifier = container.get(VerifyGooglePlayPurchase);
			const result = await verifier.run({
				userId,
				purchaseToken: body.purchaseToken,
				productId: body.productId,
			});

			return NextResponse.json({ ok: true, plan: result.plan });
		},
		(error: UserDoesNotExist | PurchaseTokenAlreadyLinked) => {
			if (error instanceof UserDoesNotExist) {
				return HttpNextResponse.domainError(error, 404);
			}

			if (error instanceof PurchaseTokenAlreadyLinked) {
				return HttpNextResponse.domainError(error, 409);
			}
		},
	);
}
