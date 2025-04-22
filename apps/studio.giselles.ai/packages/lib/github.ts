"use server";

import { db, type githubIntegrationSettings } from "@/drizzle";
import { getGitHubIdentityState } from "@/services/accounts";
import { gitHubAppInstallURL } from "@/services/external/github";
import type {
	GitHubIntegrationInstalledState,
	GitHubIntegrationInvalidCredentialState,
	GitHubIntegrationNotInstalledState,
	GitHubIntegrationUnauthorizedState,
} from "@giselle-sdk/integration";

export async function getGitHubIntegrationState(
	agentDbId: number,
): Promise<GitHubIntegrationState> {
	const identityState = await getGitHubIdentityState();
	if (identityState.status === "unauthorized") {
		return {
			status: identityState.status,
			authUrl: "/auth/connect/github",
		};
	}
	if (identityState.status === "invalid-credential") {
		return {
			status: identityState.status,
		};
	}

	const gitHubUserClient = identityState.gitHubUserClient;
	const { installations } = await gitHubUserClient.getInstallations();
	if (installations.length === 0) {
		return {
			status: "not-installed",
			installationUrl: await gitHubAppInstallURL(),
		};
	}

	const [repositories, githubIntegrationSetting] = await Promise.all([
		Promise.all(
			installations.map(async (installation) => {
				const { repositories: repos } = await gitHubUserClient.getRepositories(
					installation.id,
				);
				return repos;
			}),
		).then((repos) =>
			repos.flat().sort((a, b) => a.name.localeCompare(b.name)),
		),
		db.query.githubIntegrationSettings.findFirst({
			where: (githubIntegrationSettings, { eq }) =>
				eq(githubIntegrationSettings.agentDbId, agentDbId),
		}),
	]);
	return {
		status: "installed",
		repositories,
		setting: githubIntegrationSetting,
	};
}

export type GitHubIntegrationState = (
	| GitHubIntegrationUnauthorizedState
	| GitHubIntegrationInvalidCredentialState
	| GitHubIntegrationNotInstalledState
	| GitHubIntegrationInstalledState
) &
	GitHubIntegrationSettingState;

export type GitHubIntegrationSettingState = {
	setting?: GitHubIntegrationSetting;
};

export type GitHubIntegrationSetting = Omit<
	typeof githubIntegrationSettings.$inferSelect,
	"dbId" | "agentDbId"
>;

interface CreateGitHubIntegrationSettingSuccess {
	result: "success";
	setting: GitHubIntegrationSetting;
}
interface CreateGitHubIntegrationSettingError {
	result: "error";
	message: string;
}
export type CreateGitHubIntegrationSettingResult =
	| CreateGitHubIntegrationSettingSuccess
	| CreateGitHubIntegrationSettingError;
