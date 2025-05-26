import { getUser } from "@/lib/supabase";
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
	| GitHubIdentityStateAuthorized
	| GitHubIdentityStateError;

type GitHubIdentityStateUnauthorized = {
	status: "unauthorized";
};
type GitHubIdentityStateInvalidCredential = {
	status: "invalid-credential";
};

type GitHubIdentityStateAuthorized = {
	status: "authorized";
	gitHubUser: components["schemas"]["simple-user"];
	gitHubUserClient: GitHubUserClient;
	unlinkable: boolean;
};

type GitHubIdentityStateError = {
	status: "error";
	error: Error;
};

export async function getGitHubIdentityState(): Promise<GitHubIdentityState> {
	const credential = await getOauthCredential("github");
	if (!credential) {
		return { status: "unauthorized" };
	}

	const gitHubUserClient = buildGitHubUserClient(credential);
	try {
		const gitHubUser = await gitHubUserClient.getUser();
		const supabaseUser = await getUser();
		const unlinkable =
			(supabaseUser.identities && supabaseUser.identities.length > 1) ?? false;

		return { status: "authorized", gitHubUser, gitHubUserClient, unlinkable };
	} catch (error: unknown) {
		if (needsAuthorization(error)) {
			return { status: "invalid-credential" };
		}
		if (error instanceof Error) {
			return { status: "error", error };
		}

		return { status: "error", error: new Error(String(error)) };
	}
}
