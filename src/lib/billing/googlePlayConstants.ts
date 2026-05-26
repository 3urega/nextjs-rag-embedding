/**
 * IDs de producto de suscripción en Google Play Console.
 * Sustituye por los tuyos o lee desde env en tiempo de ejecución.
 */
export function getGooglePlayPremiumSubscriptionIds(): string[] {
	const raw = process.env.GOOGLE_PLAY_SUBSCRIPTION_PRODUCT_IDS ?? "";
	if (!raw.trim()) {
		return [];
	}

	return raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}
