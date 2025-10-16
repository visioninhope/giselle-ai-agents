// https://supabase.com/docs/guides/auth/redirect-urls
import { headers } from "next/headers";
import type { OAuthProvider } from "@/services/accounts";

export async function getAuthCallbackUrl({
	next = "/",
	provider,
}: {
	next?: string;
	provider: OAuthProvider;
}): Promise<string> {
	if (!provider) {
		throw new Error("Provider is required");
	}
	// Prefer explicit env to keep behavior consistent with main; then runtime headers; then Vercel env
	let origin: string | null = null;
	if (process.env.NEXT_PUBLIC_SITE_URL) {
		origin = process.env.NEXT_PUBLIC_SITE_URL;
	} else {
		try {
			const h = await headers();
			const proto = h.get("x-forwarded-proto") ?? "https";
			const host = h.get("x-forwarded-host") ?? h.get("host");
			if (host) origin = `${proto}://${host}`;
		} catch {
			// headers() may be unavailable; ignore
		}
		if (!origin) {
			origin = process.env.NEXT_PUBLIC_VERCEL_URL
				? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
				: "http://localhost:3000";
		}
	}
	const base = origin.endsWith("/") ? origin : `${origin}/`;
	return `${base}auth/callback/${provider}?next=${encodeURIComponent(next)}`;
}
