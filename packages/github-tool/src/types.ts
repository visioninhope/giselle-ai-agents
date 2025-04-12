export interface GitHubInstallationAppAuth {
	strategy: "github-installation";
	appId: string;
	privateKey: string;
	installationId: number;
}

export interface GitHubTokenAuth {
	strategy: "github-token";
	token: string;
}

export type GitHubAuthConfig = GitHubInstallationAppAuth | GitHubTokenAuth;
