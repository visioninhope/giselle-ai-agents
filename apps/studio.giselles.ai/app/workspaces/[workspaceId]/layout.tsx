import { db } from "@/drizzle";
import { getGitHubIntegrationState } from "@/packages/lib/github";
import { subscriptionFrom } from "@/packages/lib/subscription";
import { fetchCurrentTeam } from "@/services/teams";
import { WorkspaceId } from "@giselle-sdk/data-type";
import { WorkspaceProvider } from "giselle-sdk/react";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export default async function Layout({
	params,
	children,
}: {
	params: Promise<{ workspaceId: string }>;
	children: ReactNode;
}) {
	const workspaceId = WorkspaceId.parse((await params).workspaceId);

	const agent = await db.query.agents.findFirst({
		where: (agents, { eq }) => eq(agents.workspaceId, workspaceId),
	});
	if (agent === undefined) {
		return notFound();
	}
	const gitHubIntegrationState = await getGitHubIntegrationState(agent.dbId);

	const currentTeam = await fetchCurrentTeam();
	if (currentTeam.dbId !== agent.teamDbId) {
		return notFound();
	}
	const subscription = await subscriptionFrom(currentTeam);

	return (
		<WorkspaceProvider
			workspaceId={workspaceId}
			integration={{
				github: gitHubIntegrationState,
			}}
			subscription={{
				...subscription,
			}}
		>
			{children}
		</WorkspaceProvider>
	);
}
