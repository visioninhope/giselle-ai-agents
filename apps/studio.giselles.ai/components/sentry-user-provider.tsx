"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

interface SentryUserProviderProps {
	userId?: string;
	children: React.ReactNode;
}

export function SentryUserProvider({
	userId,
	children,
}: SentryUserProviderProps) {
	useEffect(() => {
		if (userId) {
			Sentry.setUser({
				id: userId,
			});
		}
	}, [userId]);

	return <>{children}</>;
}
