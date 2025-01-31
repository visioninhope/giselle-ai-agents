"use server";

import { db, type githubIntegrationSettings } from "@/drizzle";
import { getOauthCredential } from "@/services/accounts";
import {
	buildGitHubUserClient,
	needsAuthorization,
} from "@/services/external/github";
import type { components } from "@octokit/openapi-types";

export async function getGitHubIntegrationState(
	agentDbId: number,
): Promise<GitHubIntegrationState> {
	const credential = await getOauthCredential("github");
	if (!credential) {
		return {
			status: "unauthorized",
		};
	}

	try {
		const gitHubClient = buildGitHubUserClient(credential);
		const { installations } = await gitHubClient.getInstallations();
		if (installations.length === 0) {
			return {
				status: "not-installed",
			};
		}

		const [repositories, githubIntegrationSetting] = await Promise.all([
			Promise.all(
				installations.map(async (installation) => {
					const { repositories: repos } = await gitHubClient.getRepositories(
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
	} catch (error) {
		if (needsAuthorization(error)) {
			return {
				status: "unauthorized",
			};
		}
		throw error;
	}
}

type Repository = components["schemas"]["repository"];
export type GitHubIntegrationState = (
	| GitHubIntegrationStateUnauthorized
	| GitHubIntegrationStateNotInstalled
	| GitHubIntegrationStateInstalled
) &
	GitHubIntegrationSettingState;

export type GitHubIntegrationStateUnauthorized = {
	status: "unauthorized";
};

export type GitHubIntegrationStateNotInstalled = {
	status: "not-installed";
};

export type GitHubIntegrationStateInstalled = {
	status: "installed";
	repositories: Repository[];
};

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
