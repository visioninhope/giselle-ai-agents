"use client";

import type { Workspace, WorkspaceId } from "@giselle-sdk/data-type";
import { GenerationRunnerSystemProvider } from "@giselle-sdk/generation-runner/react";
import { useGiselleEngine } from "@giselle-sdk/giselle-engine/react";
import type { Integration } from "@giselle-sdk/integration";
import { IntegrationProvider } from "@giselle-sdk/integration/react";
import { RunSystemContextProvider } from "@giselle-sdk/run/react";
import type { Subscription } from "@giselle-sdk/subscription";
import { SubscriptionProvider } from "@giselle-sdk/subscription/react";
import { WorkflowDesignerProvider } from "@giselle-sdk/workflow-designer/react";
import { type ReactNode, useEffect, useState } from "react";

export function WorkspaceProvider({
	children,
	workspaceId,
	integration,
	subscription,
}: {
	children: ReactNode;
	workspaceId: WorkspaceId;
	integration?: Integration;
	subscription?: Subscription;
}) {
	const client = useGiselleEngine();

	const [workspace, setWorkspace] = useState<Workspace | undefined>();
	useEffect(() => {
		client
			.getWorkspace({
				workspaceId,
			})
			.then((workspace) => {
				setWorkspace(workspace);
			});
	}, [workspaceId, client]);
	if (workspace === undefined) {
		return null;
	}
	return (
		<SubscriptionProvider subscription={subscription}>
			<IntegrationProvider integration={integration}>
				<WorkflowDesignerProvider data={workspace}>
					<GenerationRunnerSystemProvider>
						<RunSystemContextProvider workspaceId={workspaceId}>
							{children}
						</RunSystemContextProvider>
					</GenerationRunnerSystemProvider>
				</WorkflowDesignerProvider>
			</IntegrationProvider>
		</SubscriptionProvider>
	);
}
