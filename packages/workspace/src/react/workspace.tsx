"use client";

import type { Workspace, WorkspaceId } from "@giselle-sdk/data-type";
import { GenerationRunnerSystemProvider } from "@giselle-sdk/generation-runner/react";
import { callGetWorkspaceApi } from "@giselle-sdk/giselle-engine/client";
import { RunSystemContextProvider } from "@giselle-sdk/run/react";
import { WorkflowDesignerProvider } from "@giselle-sdk/workflow-designer/react";
import { type ReactNode, useEffect, useState } from "react";

export function WorkspaceProvider({
	children,
	workspaceId,
}: {
	children: ReactNode;
	workspaceId: WorkspaceId;
}) {
	const [workspace, setWorkspace] = useState<Workspace | undefined>(undefined);
	useEffect(() => {
		callGetWorkspaceApi({
			workspaceId,
		}).then((workspace) => {
			setWorkspace(workspace);
		});
	}, [workspaceId]);
	if (workspace === undefined) {
		return null;
	}
	return (
		<WorkflowDesignerProvider data={workspace}>
			<GenerationRunnerSystemProvider>
				<RunSystemContextProvider workspaceId={workspaceId}>
					{children}
				</RunSystemContextProvider>
			</GenerationRunnerSystemProvider>
		</WorkflowDesignerProvider>
	);
}
