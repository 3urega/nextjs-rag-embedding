/**
 * Extrae purchaseToken y productId del JSON que devuelve el plugin de compras in-app (Android).
 * Ajusta las claves si tu versión del plugin usa otros nombres.
 */
export function parseGooglePlayPurchaseJson(raw: string): {
	purchaseToken: string;
	productId: string;
} {
	let parsed: unknown;

	try {
		parsed = JSON.parse(raw) as unknown;
	} catch {
		throw new Error("Invalid purchase JSON");
	}

	if (typeof parsed !== "object" || parsed === null) {
		throw new Error("Invalid purchase JSON shape");
	}

	const o = parsed as Record<string, unknown>;
	const purchaseToken =
		(typeof o.purchaseToken === "string" ? o.purchaseToken : null) ??
		(typeof (o as { token?: string }).token === "string" ? (o as { token: string }).token : null);

	const productId =
		(typeof o.productId === "string" ? o.productId : null) ??
		(typeof (o as { productIdentifier?: string }).productIdentifier === "string"
			? (o as { productIdentifier: string }).productIdentifier
			: null);

	if (!purchaseToken || !productId) {
		throw new Error("Missing purchaseToken or productId in purchase JSON");
	}

	return { purchaseToken, productId };
}
