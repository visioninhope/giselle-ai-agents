"use client";

import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

export function Analytics({
	children,
}: {
	children: React.ReactNode;
}) {
	if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "true") {
		return <>{children}</>;
	}
	useEffect(() => {
		try {
			const posthog_key =
				process.env.NEXT_PUBLIC_POSTHOG_KEY ??
				envVarError("NEXT_PUBLIC_POSTHOG_KEY");
			const posthog_host =
				process.env.NEXT_PUBLIC_POSTHOG_HOST ??
				envVarError("NEXT_PUBLIC_POSTHOG_HOST");

			posthog.init(posthog_key, {
				api_host: posthog_host,
				person_profiles: "identified_only",
				capture_pageview: false,
			});
		} catch (error) {
			Sentry.captureException(error);
			if (process.env.NODE_ENV !== "production") {
				console.error("Analytics:", error);
			}
		}
	}, []);

	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

function envVarError(envVar: string): never {
	throw new Error(`${envVar} is not defined`);
}
