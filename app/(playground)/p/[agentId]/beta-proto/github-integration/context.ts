import type { GitHubUserClient } from "@/services/external/github";
import { createContext, useContext } from "react";

export type Repository = Awaited<
	ReturnType<GitHubUserClient["getRepositories"]>
>["repositories"][number];

interface GitHubIntegrationState {
	repositories: Repository[];
	needsAuthorization: boolean;
}

export const GitHubIntegrationContext =
	createContext<GitHubIntegrationState | null>(null);

export function useGitHubIntegration() {
	const context = useContext(GitHubIntegrationContext);
	if (!context) {
		throw new Error(
			"useGitHubIntegration must be used within a GitHubIntegrationProvider",
		);
	}
	return context;
}
