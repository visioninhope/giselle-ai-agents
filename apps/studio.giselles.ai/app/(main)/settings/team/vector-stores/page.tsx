import { Card } from "@/components/ui/card";
import { db, githubRepositoryIndex } from "@/drizzle";
import { getGitHubIdentityState } from "@/services/accounts";
import { fetchCurrentTeam } from "@/services/teams";
import { desc, eq } from "drizzle-orm";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "../../components/button";
import { deleteRepositoryIndex, registerRepositoryIndex } from "./actions";
import { DebugPanel } from "./debug-panel";
import { RepositoryItem } from "./repository-item";
import { RepositoryRegistrationDialog } from "./repository-registration-dialog";

export default async function TeamVectorStorePage({
	searchParams,
}: {
	searchParams: { debug?: string };
}) {
	const debugState = searchParams.debug;

	// Mock data for debug states
	if (debugState === "unauthorized") {
		return (
			<>
				<DebugPanel currentState="unauthorized" />
				<GitHubAuthRequiredCard />
			</>
		);
	}

	if (debugState === "error") {
		return (
			<>
				<DebugPanel currentState="error" />
				<GitHubAuthErrorCard errorMessage="Mock GitHub authentication error for debugging" />
			</>
		);
	}

	if (debugState === "no-installation") {
		return (
			<>
				<DebugPanel currentState="no-installation" />
				<GitHubAppInstallRequiredCard />
			</>
		);
	}

	if (debugState === "multiple-repos") {
		const mockInstallationsWithRepos = [
			{
				installation: { id: 1, name: "test-org" },
				repositories: [
					{ id: 1, owner: "test-org", name: "repo1" },
					{ id: 2, owner: "test-org", name: "repo2" },
				],
			},
		];

		const mockRepositoryIndexes = [
			{
				id: "1",
				repositoryName: "repo1",
				repositoryOwner: "test-org",
				status: "completed",
				dbId: "mock-1",
				teamDbId: "mock-team",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "2",
				repositoryName: "repo2",
				repositoryOwner: "test-org",
				status: "processing",
				dbId: "mock-2",
				teamDbId: "mock-team",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "3",
				repositoryName: "repo3",
				repositoryOwner: "test-org",
				status: "completed",
				dbId: "mock-3",
				teamDbId: "mock-team",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		return (
			<>
				<DebugPanel
					currentState="multiple-repos"
					repositoryCount={mockRepositoryIndexes.length}
				/>
				<div className="flex flex-col gap-[24px]">
					<div className="flex justify-between items-center">
						<h1
							className="text-[30px] font-sans font-medium text-[hsl(192,73%,84%)]"
							style={{
								textShadow:
									"0 0 20px #0087f6, 0 0 40px #0087f6, 0 0 60px #0087f6",
							}}
						>
							Vector Stores
						</h1>
						<a
							href="https://docs.giselles.ai/guides/settings/team/vector-store"
							target="_blank"
							rel="noopener noreferrer"
							className="text-black-300 text-[14px] font-medium rounded-[4px] px-1.5 py-0.5 hover:bg-black-300/10 flex items-center gap-1.5 font-sans"
						>
							About Vector Stores
							<ExternalLink size={14} />
						</a>
					</div>

					<RepositoryListCard
						registrationDialog={
							<RepositoryRegistrationDialog
								installationsWithRepos={mockInstallationsWithRepos}
								registerRepositoryIndexAction={registerRepositoryIndex}
							/>
						}
						repositoryIndexes={mockRepositoryIndexes}
					/>
				</div>
			</>
		);
	}

	// Normal flow - fetch real data
	const githubIdentityState = await getGitHubIdentityState();
	if (
		githubIdentityState.status === "unauthorized" ||
		githubIdentityState.status === "invalid-credential"
	) {
		return (
			<>
				<DebugPanel currentState="unauthorized" />
				<GitHubAuthRequiredCard />
			</>
		);
	}

	if (githubIdentityState.status === "error") {
		return (
			<>
				<DebugPanel currentState="error" />
				<GitHubAuthErrorCard errorMessage={githubIdentityState.errorMessage} />
			</>
		);
	}

	const userClient = githubIdentityState.gitHubUserClient;
	const installationData = await userClient.getInstallations();
	if (installationData.total_count === 0) {
		return (
			<>
				<DebugPanel currentState="no-installation" />
				<GitHubAppInstallRequiredCard />
			</>
		);
	}
	const installations = installationData.installations;

	const installationsWithRepos = await Promise.all(
		installations.map(async (installation) => {
			const repos = await userClient.getRepositories(installation.id);
			const installationId = installation.id;
			if (!installation.account) {
				throw new Error("Installation account is null");
			}

			const installationName =
				"login" in installation.account
					? installation.account.login
					: installation.account.name;

			return {
				installation: {
					id: installationId,
					name: installationName,
				},
				repositories: repos.repositories.map((repo) => ({
					id: repo.id,
					owner: repo.owner.login,
					name: repo.name,
				})),
			};
		}),
	);

	const repositoryIndexes = await getGitHubRepositoryIndexes();

	return (
		<>
			<DebugPanel
				currentState={
					repositoryIndexes.length > 2 ? "multiple-repos" : "connected"
				}
				repositoryCount={repositoryIndexes.length}
			/>
			<div className="flex flex-col gap-[24px]">
				<div className="flex justify-between items-center">
					<h1
						className="text-[30px] font-sans font-medium text-[hsl(192,73%,84%)]"
						style={{
							textShadow:
								"0 0 20px #0087f6, 0 0 40px #0087f6, 0 0 60px #0087f6",
						}}
					>
						Vector Stores
					</h1>
					<a
						href="https://docs.giselles.ai/guides/settings/team/vector-store"
						target="_blank"
						rel="noopener noreferrer"
						className="text-black-300 text-[14px] font-medium rounded-[4px] px-1.5 py-0.5 hover:bg-black-300/10 flex items-center gap-1.5 font-sans"
					>
						About Vector Stores
						<ExternalLink size={14} />
					</a>
				</div>

				<RepositoryListCard
					registrationDialog={
						<RepositoryRegistrationDialog
							installationsWithRepos={installationsWithRepos}
							registerRepositoryIndexAction={registerRepositoryIndex}
						/>
					}
					repositoryIndexes={repositoryIndexes}
				/>
			</div>
		</>
	);
}

function GitHubAuthRequiredCard() {
	return (
		<div className="flex flex-col gap-[24px]">
			<div className="flex justify-between items-center">
				<h2
					className="text-[30px] font-sans font-medium text-[hsl(192,73%,84%)]"
					style={{
						textShadow: "0 0 20px #0087f6, 0 0 40px #0087f6, 0 0 60px #0087f6",
					}}
				>
					Vector Store
				</h2>
				<a
					href="https://docs.giselles.ai/guides/settings/team/vector-store"
					target="_blank"
					rel="noopener noreferrer"
					className="text-black-300 text-[14px] font-medium rounded-[4px] px-1.5 py-0.5 hover:bg-black-300/10 flex items-center gap-1.5 font-sans"
				>
					About Vector Stores
					<ExternalLink size={14} />
				</a>
			</div>
			<Card className="rounded-[8px] bg-transparent p-6 border-0">
				<div className="flex flex-col items-center justify-center py-8">
					<h4 className="text-white-400 font-medium text-[18px] leading-[21.6px] font-sans mb-2">
						You need to authenticate your GitHub account.
					</h4>
					<p className="text-black-400 text-[14px] leading-[20.4px] font-geist text-center mb-4">
						To use Vector Store, you need to authenticate your GitHub account.
						Please authenticate in the account settings.
					</p>
					<Button asChild variant="primary">
						<a href="/settings/account/authentication">
							Open Authentication Settings
						</a>
					</Button>
				</div>
			</Card>
		</div>
	);
}

function GitHubAuthErrorCard({ errorMessage }: { errorMessage: string }) {
	return (
		<div className="flex flex-col gap-[24px]">
			<div className="flex justify-between items-center">
				<h2
					className="text-[30px] font-sans font-medium text-[hsl(192,73%,84%)]"
					style={{
						textShadow: "0 0 20px #0087f6, 0 0 40px #0087f6, 0 0 60px #0087f6",
					}}
				>
					Vector Store
				</h2>
				<a
					href="https://docs.giselles.ai/guides/settings/team/vector-store"
					target="_blank"
					rel="noopener noreferrer"
					className="text-black-300 text-[14px] font-medium rounded-[4px] px-1.5 py-0.5 hover:bg-black-300/10 flex items-center gap-1.5 font-sans"
				>
					About Vector Stores
					<ExternalLink size={14} />
				</a>
			</div>
			<Card className="rounded-[8px] bg-transparent p-6 border-0">
				<div className="flex flex-col items-center justify-center py-8">
					<div className="flex items-center gap-2 mb-4">
						<AlertCircle className="text-error-900" size={24} />
						<h4 className="text-error-900 font-medium text-[18px] leading-[21.6px] font-sans">
							GitHub authentication error occurred.
						</h4>
					</div>
					<p className="text-error-900/70 text-[14px] leading-[20.4px] font-geist text-center mb-4">
						{errorMessage}
					</p>
				</div>
			</Card>
		</div>
	);
}

function GitHubAppInstallRequiredCard() {
	return (
		<div className="flex flex-col gap-[24px]">
			<div className="flex justify-between items-center">
				<h2
					className="text-[30px] font-sans font-medium text-[hsl(192,73%,84%)]"
					style={{
						textShadow: "0 0 20px #0087f6, 0 0 40px #0087f6, 0 0 60px #0087f6",
					}}
				>
					Vector Store
				</h2>
				<a
					href="https://docs.giselles.ai/guides/settings/team/vector-store"
					target="_blank"
					rel="noopener noreferrer"
					className="text-black-300 text-[14px] font-medium rounded-[4px] px-1.5 py-0.5 hover:bg-black-300/10 flex items-center gap-1.5 font-sans"
				>
					About Vector Stores
					<ExternalLink size={14} />
				</a>
			</div>
			<Card className="rounded-[8px] bg-transparent p-6 border-0">
				<div className="flex flex-col items-center justify-center py-8">
					<h4 className="text-white-400 font-medium text-[18px] leading-[21.6px] font-sans mb-2">
						You need to install Giselle's GitHub App.
					</h4>
					<p className="text-black-400 text-[14px] leading-[20.4px] font-geist text-center mb-4">
						To use Vector Store, you need to install Giselle's GitHub App.
						Please install in the integrations settings.
					</p>
					<Button asChild variant="primary">
						<a href="/settings/team/integrations">Open Integrations Settings</a>
					</Button>
				</div>
			</Card>
		</div>
	);
}

type RepositoryListCardProps = {
	registrationDialog: React.ReactNode;
	repositoryIndexes: Awaited<ReturnType<typeof getGitHubRepositoryIndexes>>;
};

function RepositoryListCard({
	registrationDialog,
	repositoryIndexes,
}: RepositoryListCardProps) {
	return (
		<div className="flex flex-col gap-y-[16px]">
			<Card className="rounded-[8px] bg-transparent p-6 border-0">
				<div className="flex items-center mb-4">
					<div>
						<h4 className="text-white-400 font-medium text-[18px] leading-[21.6px] font-sans">
							GitHub Repositories
						</h4>
						<p className="text-black-400 text-[14px] leading-[20.4px] font-geist mt-1">
							You can ingest your project's code into Vector Store and use it in
							GitHub Vector Store Nodes.
						</p>
					</div>
					<div className="ml-auto">{registrationDialog}</div>
				</div>

				{repositoryIndexes.length > 0 ? (
					<div className="space-y-4">
						{repositoryIndexes.map((index) => (
							<RepositoryItem
								key={index.id}
								repositoryIndex={index}
								deleteRepositoryIndexAction={deleteRepositoryIndex}
							/>
						))}
					</div>
				) : (
					<EmptyRepositoryCard />
				)}
			</Card>
		</div>
	);
}

function EmptyRepositoryCard() {
	return (
		<div className="text-black-400 text-center py-8">
			No repositories are registered. Please register a repository using the
			"Register Repository" button.
		</div>
	);
}

async function getGitHubRepositoryIndexes() {
	const team = await fetchCurrentTeam();
	const records = await db
		.select()
		.from(githubRepositoryIndex)
		.where(eq(githubRepositoryIndex.teamDbId, team.dbId))
		.orderBy(desc(githubRepositoryIndex.dbId));
	return records;
}
