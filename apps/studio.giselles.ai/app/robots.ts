import type { MetadataRoute } from "next";

const productionSiteUrl = "https://studio.giselles.ai";
const localSiteUrl = "http://localhost:3000";
const allowedProtocols = new Set(["http:", "https:"]);

const isNonEmptyString = (value: unknown): value is string =>
	typeof value === "string" && value.trim().length > 0;

const normalizeUrl = (rawUrl: string): string | null => {
	try {
		const parsed = new URL(rawUrl);
		if (allowedProtocols.has(parsed.protocol)) {
			return parsed.origin;
		}
		return null;
	} catch {
		return null;
	}
};

const resolveConfiguredUrl = (): string | null => {
	const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
	if (isNonEmptyString(configuredUrl)) {
		const normalized = normalizeUrl(configuredUrl);
		if (normalized !== null) {
			return normalized;
		}
	}
	return null;
};

const resolvePreviewUrl = (): string | null => {
	const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
	if (isNonEmptyString(vercelUrl)) {
		const normalized = normalizeUrl(`https://${vercelUrl}`);
		if (normalized !== null) {
			return normalized;
		}
	}
	const serverVercelUrl = process.env.VERCEL_URL;
	if (isNonEmptyString(serverVercelUrl)) {
		return normalizeUrl(`https://${serverVercelUrl}`);
	}
	return null;
};

const resolveSiteUrl = (): string => {
	const configuredUrl = resolveConfiguredUrl();
	if (configuredUrl !== null) {
		return configuredUrl;
	}
	const vercelEnv = process.env.VERCEL_ENV;
	if (vercelEnv === "production") {
		return productionSiteUrl;
	}
	if (vercelEnv === "preview") {
		const previewUrl = resolvePreviewUrl();
		if (previewUrl !== null) {
			return previewUrl;
		}
	}
	return localSiteUrl;
};

export default function robots(): MetadataRoute.Robots {
	const siteUrl = resolveSiteUrl();
	return {
		rules: [
			{
				userAgent: "*",
				disallow: [
					"/join/",
					"/auth/callback/",
					"/auth/connect/",
					"/password_reset/confirm",
					"/webhooks/",
					"/api/giselle/",
					"/api/vector-stores/",
				],
			},
		],
		sitemap: [`${siteUrl}/sitemap.xml`],
	};
}
