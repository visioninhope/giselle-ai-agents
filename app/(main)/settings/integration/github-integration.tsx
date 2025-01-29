import { getOauthCredential } from "@/app/(auth)/lib";
import {
	type GitHubUserClient,
	buildGitHubUserClient,
	gitHubAppInstallURL,
	needsAuthorization,
} from "@/services/external/github";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Building2 } from "lucide-react";
import { GitHubAppConfigureButton } from "../../../../packages/components/github-app-configure-button";
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

		return (
			<Card
				title="GitHub Integration"
				description={`Logged in as @${gitHubUser.login}.`}
				action={{
					component: (
						<GitHubAppConfigureButton
							installationUrl={await gitHubAppInstallURL()}
						/>
					),
				}}
			>
				{installations.map((installation) => (
					<Installation key={installation.id} installation={installation} />
				))}
			</Card>
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
	>["installations"][number];
};

function Installation({ installation }: InstallationProps) {
	const account = installation.account;
	if (!account) {
		return;
	}

	return (
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
	);
}
