import { UserPlan } from "../../contexts/mooc/users/domain/UserPlan";

/**
 * Patrón de límites por plan: sustituye por reglas de negocio reales (cuotas, features, etc.).
 */
export function maxEmbeddingsPerQueryForPlan(plan: UserPlan): number {
	switch (plan) {
		case UserPlan.Premium:
			return 50;
		case UserPlan.Free:
		default:
			return 10;
	}
}
