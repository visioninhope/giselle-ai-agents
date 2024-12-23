"use client";

import type { gitHubIntegrations, githubIntegrationSettings } from "@/drizzle";
import type { components } from "@octokit/openapi-types";
import { createContext, useContext } from "react";
import type { CreateGitHubIntegrationSettingResult } from "../lib/github";

type Repository = components["schemas"]["repository"];

export interface GitHubIntegrationState {
	repositories: Repository[];
	needsAuthorization: boolean;
	setting: typeof githubIntegrationSettings.$inferSelect | undefined;
}

export const GitHubIntegrationContext =
	createContext<GitHubIntegrationState | null>(null);

export function GitHubIntegrationProvider({
	children,
	...value
}: GitHubIntegrationState & {
	children: React.ReactNode;
	createGitHubIntegrationSettingAction: (
		_: unknown,
		formData: FormData,
	) => Promise<CreateGitHubIntegrationSettingResult>;
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
