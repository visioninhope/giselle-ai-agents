import { getOauthCredential } from "@/app/(auth)/lib";
import { db } from "@/drizzle";
import {
	buildGitHubUserClient,
	needsAuthorization,
} from "@/services/external/github";
import type { GitHubIntegrationState } from "../contexts/github-integration";

export async function getGitHubIntegrationState(
	agentDbId: number,
): Promise<GitHubIntegrationState> {
	const credential = await getOauthCredential("github");
	if (!credential) {
		return {
			needsAuthorization: true,
			repositories: [],
			integration: undefined,
		};
	}

	try {
		const gitHubClient = buildGitHubUserClient(credential);
		const { installations } = await gitHubClient.getInstallations();
		const [repositories, gitHubIntegration] = await Promise.all([
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
			db.query.gitHubIntegrations.findFirst({
				where: (gitHubIntegrations, { eq }) =>
					eq(gitHubIntegrations.agentDbId, agentDbId),
			}),
		]);
		return {
			needsAuthorization: false,
			repositories,
			integration: gitHubIntegration,
		};
	} catch (error) {
		if (needsAuthorization(error)) {
			return {
				needsAuthorization: true,
				repositories: [],
				integration: undefined,
			};
		}
		throw error;
	}
}
