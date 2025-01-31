import { getOauthCredential } from "@/app/(auth)/lib";
import {
	type GitHubUserClient,
	buildGitHubUserClient,
	gitHubAppInstallURL,
	needsAuthorization,
} from "@/services/external/github";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { GitHubAppInstallButton } from "../../../../packages/components/github-app-install-button";
import { Card } from "../components/card";

export async function GitHubIntegration() {
	const credential = await getOauthCredential("github");
	if (!credential) {
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

	const gitHubClient = buildGitHubUserClient(credential);
	try {
		const gitHubUser = await gitHubClient.getUser();
		const { installations } = await gitHubClient.getInstallations();
		const installationsWithRepos = await Promise.all(
			installations.map(async (installation) => {
				const repos = await gitHubClient.getRepositories(installation.id);
				return {
					...installation,
					repositories: repos.repositories,
				};
			}),
		);

		return (
			<div className="space-y-8 text-black-30">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<SiGithub className="w-8 h-8" />
						<div>
							<h2 className="text-lg">GitHub</h2>
							<div className="text-sm text-muted-foreground">
								Logged in as (
								<span className="text-blue-500">@{gitHubUser.login}</span>)
							</div>
						</div>
					</div>
					<div>
						<GitHubAppInstallButton
							installationUrl={await gitHubAppInstallURL()}
							installed={installations.length > 0}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{installationsWithRepos.map((installation) => (
						<Installation key={installation.id} installation={installation} />
					))}
				</div>
			</div>
		);
	} catch (error) {
		if (needsAuthorization(error)) {
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
		throw error;
	}
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
		return null;
	}

	const displayName = "login" in account ? account.login : account.name || "";
	const avatarUrl = "avatar_url" in account ? account.avatar_url : undefined;

	return (
		<div className="overflow-hidden rounded-lg border border-black-70">
			<div className="flex items-center space-x-3 border-b border-black-70 p-3 bg-black-70">
				{avatarUrl && (
					<img
						src={avatarUrl}
						alt={displayName}
						className="w-6 h-6 rounded-full"
					/>
				)}
				<span>{displayName}</span>
			</div>
			<div className="p-4 space-y-3">
				{installation.repositories.map((repo) => (
					<div key={repo.id} className="flex items-center">
						<a
							href={repo.html_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm hover:underline"
						>
							{repo.name}
						</a>
						<span className="ml-2 rounded-full px-2 py-0.5 text-xs border border-black-30">
							{repo.private ? "Private" : "Public"}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
