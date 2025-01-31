import { getGitHubIdentityState } from "@/services/accounts";
import {
	type GitHubUserClient,
	gitHubAppInstallURL,
} from "@/services/external/github";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Building2, Lock, Unlock } from "lucide-react";
import { GitHubAppInstallButton } from "../../../../packages/components/github-app-install-button";
import { Card } from "../components/card";

export async function GitHubIntegration() {
	const identityState = await getGitHubIdentityState();
	if (identityState.status === "unauthorized") {
		return (
			<Card
				title="GitHub Integration"
				description="Connect your GitHub account to enable additional features"
				action={{
					content: "Account",
					href: "/settings/account",
				}}
			/>
		);
	}
	if (identityState.status === "invalid-credential") {
		return (
			<Card
				title="GitHub Integration"
				description="Your GitHub access token has expired or become invalid. Please reconnect to continue using the service."
				action={{
					content: "Account",
					href: "/settings/account",
				}}
			/>
		);
	}

	const gitHubUserClient = identityState.gitHubUserClient;
	const { installations } = await gitHubUserClient.getInstallations();
	const installationsWithRepos = await Promise.all(
		installations.map(async (installation) => {
			const repos = await gitHubUserClient.getRepositories(installation.id);
			return {
				...installation,
				repositories: repos.repositories,
			};
		}),
	);
	const gitHubUser = identityState.gitHubUser;
	const installationUrl = await gitHubAppInstallURL();

	return (
		<Card
			title="GitHub Integration"
			description={`Logged in as @${gitHubUser.login}.`}
			action={{
				component: (
					<GitHubAppInstallButton
						installationUrl={installationUrl}
						installed={installations.length > 0}
					/>
				),
			}}
		>
			{installationsWithRepos.map((installation) => (
				<Installation key={installation.id} installation={installation} />
			))}
		</Card>
	);
}

type InstallationProps = {
	installation: Awaited<
		ReturnType<GitHubUserClient["getInstallations"]>
	>["installations"][number] & {
		repositories: Awaited<
			ReturnType<GitHubUserClient["getRepositories"]>
		>["repositories"];
	};
};

function Installation({ installation }: InstallationProps) {
	const account = installation.account;
	if (!account) {
		return;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center space-x-4">
				{"login" in account ? (
					<>
						<SiGithub className="w-6 h-6 text-primary" size={24} />
						<span className="font-medium">{account.login}</span>
					</>
				) : (
					<>
						<Building2 className="w-6 h-6 text-primary" size={24} />
						<span className="font-medium">{account.name}</span>
					</>
				)}
			</div>
			<div className="space-y-2 pl-10">
				{installation.repositories.map((repo) => (
					<div key={repo.id} className="flex items-center space-x-2">
						{repo.private ? (
							<Lock className="w-4 h-4 text-muted-foreground" />
						) : (
							<Unlock className="w-4 h-4 text-muted-foreground" />
						)}
						<a
							href={repo.html_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm hover:underline"
						>
							{repo.name}
						</a>
					</div>
				))}
			</div>
		</div>
	);
}
