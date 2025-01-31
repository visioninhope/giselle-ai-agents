import type { components } from "@octokit/openapi-types";
import {
	type GitHubUserClient,
	buildGitHubUserClient,
	needsAuthorization,
} from "../external/github";
import { getOauthCredential } from "./oauth-credentials";

type GitHubIdentityState =
	| GitHubIdentityStateUnauthorized
	| GitHubIdentityStateInvalidCredential
	| GitHubIdentityStateAuthorized;

type GitHubIdentityStateUnauthorized = {
	state: "unauthorized";
};
type GitHubIdentityStateInvalidCredential = {
	state: "invalid-credential";
};

type GitHubIdentityStateAuthorized = {
	state: "authorized";
	gitHubUser: components["schemas"]["simple-user"];
	gitHubUserClient: GitHubUserClient;
};

export async function getGitHubIdentityState(): Promise<GitHubIdentityState> {
	const credential = await getOauthCredential("github");
	if (!credential) {
		return { state: "unauthorized" };
	}

	const gitHubUserClient = buildGitHubUserClient(credential);
	try {
		const gitHubUser = await gitHubUserClient.getUser();
		return { state: "authorized", gitHubUser, gitHubUserClient };
	} catch (error) {
		if (needsAuthorization(error)) {
			return { state: "invalid-credential" };
		}
		throw error;
	}
}
