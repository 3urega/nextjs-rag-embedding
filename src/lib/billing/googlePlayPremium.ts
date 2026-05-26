function newReferenceUuid(): string {
	if (typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto) {
		return globalThis.crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Integración con `@adplorg/capacitor-in-app-purchase` en el cliente (Capacitor).
 * Importación dinámica para no cargar el plugin en SSR / Node.
 */
export async function purchasePremiumSubscription(productId: string): Promise<string> {
	const { CapacitorInAppPurchase } = await import("@adplorg/capacitor-in-app-purchase");
	const { transaction } = await CapacitorInAppPurchase.purchaseSubscription({
		productId,
		referenceUUID: newReferenceUuid(),
	});

	return transaction;
}

/** Lista de transacciones JSON activas según la tienda (Android/iOS). */
export async function restorePremiumSubscriptions(): Promise<string[]> {
	const { CapacitorInAppPurchase } = await import("@adplorg/capacitor-in-app-purchase");
	const { subscriptions } = await CapacitorInAppPurchase.getActiveSubscriptions();

	return subscriptions;
}
