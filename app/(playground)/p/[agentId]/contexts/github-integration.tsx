"use client";

import type { gitHubIntegrations } from "@/drizzle";
import type { components } from "@octokit/openapi-types";
import { createId } from "@paralleldrive/cuid2";
import { createContext, useContext } from "react";

type GitHubIntegrationId = `gthb_${string}`;
function generateId() {
	return `gthb_${createId()}` satisfies GitHubIntegrationId;
}
type Repository = components["schemas"]["repository"];

export interface GitHubIntegrationState {
	repositories: Repository[];
	needsAuthorization: boolean;
	integration: typeof gitHubIntegrations.$inferSelect | undefined;
}

export const GitHubIntegrationContext =
	createContext<GitHubIntegrationState | null>(null);

export function GitHubIntegrationProvider({
	children,
	...value
}: GitHubIntegrationState & {
	children: React.ReactNode;
}) {
	return (
		<GitHubIntegrationContext.Provider value={value}>
			{children}
		</GitHubIntegrationContext.Provider>
	);
}

export function useGitHubIntegration() {
	const context = useContext(GitHubIntegrationContext);
	if (!context) {
		throw new Error(
			"useGitHubIntegration must be used within a GitHubIntegrationProvider",
		);
	}
	return context;
}
