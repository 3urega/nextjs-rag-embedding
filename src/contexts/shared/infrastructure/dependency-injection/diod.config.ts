import "reflect-metadata";

import { ContainerBuilder } from "diod";

import { loadProjectEnv } from "../../../../lib/loadProjectEnv";
import { DemoPlanSetter } from "../../../billing/demo/application/DemoPlanSetter";
import { SyncUserPlanFromGooglePlay } from "../../../billing/google_play_subscription/application/sync/SyncUserPlanFromGooglePlay";
import { VerifyGooglePlayPurchase } from "../../../billing/google_play_subscription/application/verify/VerifyGooglePlayPurchase";
import { GooglePlaySubscriptionRepository } from "../../../billing/google_play_subscription/domain/GooglePlaySubscriptionRepository";
import { PostgresGooglePlaySubscriptionRepository } from "../../../billing/google_play_subscription/infrastructure/PostgresGooglePlaySubscriptionRepository";
import { UserAuthenticator } from "../../../identity/users/application/authenticate/UserAuthenticator";
import { UserFinder } from "../../../identity/users/application/find/UserFinder";
import { UserRegistrar } from "../../../identity/users/application/register/UserRegistrar";
import { UserProfileUpdater } from "../../../identity/users/application/update_profile/UserProfileUpdater";
import { UserRepository } from "../../../identity/users/domain/UserRepository";
import { PostgresUserRepository } from "../../../identity/users/infrastructure/PostgresUserRepository";
import { PostgresConnection } from "../postgres/PostgresConnection";

loadProjectEnv();

const builder = new ContainerBuilder();

builder
	.register(PostgresConnection)
	.useFactory(() => {
		const host = process.env.POSTGRES_HOST ?? "localhost";
		const port = Number(process.env.POSTGRES_PORT ?? "5432");
		const user = process.env.POSTGRES_USER ?? "codely";
		const password = process.env.POSTGRES_PASSWORD ?? "c0d3ly7v";
		const database = process.env.POSTGRES_DB ?? "postgres";

		return new PostgresConnection(host, port, user, password, database);
	})
	.asSingleton();

builder.register(UserRepository).use(PostgresUserRepository);
builder.registerAndUse(PostgresUserRepository);

builder.registerAndUse(UserRegistrar);
builder.registerAndUse(UserAuthenticator);
builder.registerAndUse(UserFinder);
builder.registerAndUse(UserProfileUpdater);

builder.register(GooglePlaySubscriptionRepository).use(PostgresGooglePlaySubscriptionRepository);
builder.registerAndUse(PostgresGooglePlaySubscriptionRepository);

builder.registerAndUse(VerifyGooglePlayPurchase);
builder.registerAndUse(SyncUserPlanFromGooglePlay);
builder.registerAndUse(DemoPlanSetter);

export const container = builder.build();
